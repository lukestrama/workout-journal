import { localSyncService } from "../supabase/services";
import { useUser } from "@clerk/nextjs";
import { Workout } from "../supabase/models";
import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "../supabase/SupabaseProvider";
import { db } from "../db";
import { genRandomInt } from "../utils";

export function useWorkouts() {
  const { user } = useUser();
  const { supabase } = useSupabase();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>("");

  // Extract stable user ID to prevent unnecessary re-renders on session refresh
  const userId = user?.id;

  const getWorkoutsSortedByDate = async () => {
    const workouts = await db.workouts;
    const activeWorkouts = await workouts.filter((w) => !w.deleted).toArray();
    return activeWorkouts.sort((a, b) => (a.date < b.date ? 1 : -1));
  };

  const loadWorkouts = useCallback(async () => {
    if (!userId) return;
    try {
      // Returns all workouts sorted by date ascending
      const workouts = await getWorkoutsSortedByDate();
      setWorkouts(workouts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workouts.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadWorkouts();
    }
  }, [userId, loadWorkouts]);

  const initialDataSync = useCallback(async () => {
    if (!userId) return;
    await localSyncService.fullInitialSync(userId, supabase!);
    loadWorkouts();
  }, [userId, supabase, loadWorkouts]);

  async function createWorkout(
    title: string,
    date: string,
    type: string
  ): Promise<number | void> {
    if (!userId) throw Error("Must be signed in to create a workout");

    try {
      setLoading(true);
      const workoutId = await db.workouts.put({
        title,
        date,
        type,
        exercises: [],
        user_id: userId,
        id: genRandomInt(),
        synced: false,
      });

      setWorkouts(await getWorkoutsSortedByDate());

      return workoutId;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create workout"
      );
    }
  }

  async function deleteWorkout(workoutId: number) {
    if (!workoutId) return;

    try {
      const workout = await db.workouts.get(workoutId);
      if (workout?.synced === true) {
        // Soft delete from Dexie if synced
        await db.workouts.update(workoutId, { deleted: true });
      } else {
        await db.workouts.delete(workoutId);
      }
      setWorkouts(await getWorkoutsSortedByDate());
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete workout"
      );
    }
  }

  return {
    workouts,
    loading,
    error,
    createWorkout,
    deleteWorkout,
    initialDataSync,
  };
}
