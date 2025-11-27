import { SupabaseClient } from "@supabase/supabase-js";
import { db } from "../db";

export async function syncWithSupabase(supabase: SupabaseClient) {
  const lastSynced = (await db.metadata.get("lastSyncedAt"))?.value ?? null;

  // First, let's check if we have any records without synced field and fix them
  const allWorkouts = await db.workouts.toArray();
  const allExercises = await db.exercises.toArray();
  const allSets = await db.sets.toArray();

  // Fix any records without synced field (assuming they're synced if they exist)
  for (const workout of allWorkouts) {
    if (workout.synced === undefined) {
      await db.workouts.update(workout.id, { synced: true });
    }
  }
  for (const exercise of allExercises) {
    if (exercise.synced === undefined) {
      await db.exercises.update(exercise.id!, { synced: true });
    }
  }
  for (const set of allSets) {
    if (set.synced === undefined) {
      await db.sets.update(set.id!, { synced: true });
    }
  }

  // -----------------------------
  // 1. PUSH local unsynced changes
  // -----------------------------
  const unsyncedWorkouts = await db.workouts
    .filter((w) => w.synced === false)
    .toArray();
  const unsyncedExercises = await db.exercises
    .filter((e) => e.synced === false)
    .toArray();
  const unsyncedSets = await db.sets
    .filter((s) => s.synced === false)
    .toArray();

  for (const w of unsyncedWorkouts) {
    delete w.exercises;
    delete w.synced;
  }
  for (const e of unsyncedExercises) {
    delete e.sets;
    delete e.synced;
  }
  for (const s of unsyncedSets) {
    delete s.synced;
  }

  // Push to Supabase (example)
  await supabase.from("workouts").upsert(unsyncedWorkouts);
  await supabase.from("exercises").upsert(unsyncedExercises);
  await supabase.from("sets").upsert(unsyncedSets);

  const deletedWorkouts = await db.workouts
    .filter((w) => w.deleted === true)
    .toArray();
  const deletedExercises = await db.exercises
    .filter((e) => e.deleted === true)
    .toArray();
  const deletedSets = await db.sets.filter((s) => s.deleted === true).toArray();

  // Mark them as synced
  await db.transaction("rw", db.workouts, db.exercises, db.sets, async () => {
    for (const w of unsyncedWorkouts)
      await db.workouts.update(w.id, { synced: true });
    for (const e of unsyncedExercises)
      await db.exercises.update(e.id!, { synced: true });
    for (const s of unsyncedSets) await db.sets.update(s.id!, { synced: true });
  });

  await supabase
    .from("workouts")
    .delete()
    .in(
      "id",
      deletedWorkouts.map((w) => w.id)
    );
  await supabase
    .from("exercises")
    .delete()
    .in(
      "id",
      deletedExercises.map((e) => e.id)
    );
  await supabase
    .from("sets")
    .delete()
    .in(
      "id",
      deletedSets.map((s) => s.id)
    );

  await Promise.all([
    db.workouts.bulkDelete(deletedWorkouts.map((w) => w.id)),
    db.exercises.bulkDelete(deletedExercises.map((e) => e.id)),
    db.sets.bulkDelete(deletedSets.map((s) => s.id)),
  ]);

  // -----------------------------
  // 2. PULL remote changes
  // -----------------------------
  const { data: remoteWorkouts } = await supabase
    .from("workouts")
    .select("*")
    .gt("updated_at", lastSynced);

  const { data: remoteExercises } = await supabase
    .from("exercises")
    .select("*")
    .gt("updated_at", lastSynced);

  const { data: remoteSets } = await supabase
    .from("sets")
    .select("*")
    .gt("updated_at", lastSynced);

  // Insert or update locally
  await db.workouts.bulkPut(
    remoteWorkouts?.map((w) => ({ ...w, synced: true })) ?? []
  );
  await db.exercises.bulkPut(
    remoteExercises?.map((e) => ({ ...e, synced: true })) ?? []
  );
  await db.sets.bulkPut(remoteSets?.map((s) => ({ ...s, synced: true })) ?? []);

  // -----------------------------
  // 3. Write new timestamp
  // -----------------------------
  await db.metadata.put({
    key: "lastSyncedAt",
    value: new Date().toISOString(),
  });

  return true;
}
