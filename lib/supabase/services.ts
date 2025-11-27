import { Exercise, ExerciseSet, UserExercise, Workout } from "./models";
import { SupabaseClient } from "@supabase/supabase-js";
import { db } from "../db";

export const localSyncService = {
  async fullInitialSync(userId: string, supabase: SupabaseClient) {
    try {
      console.log("Starting initial sync for user:", userId);

      const { data: workouts, error: workoutError } = await supabase
        .from("workouts")
        .select("*, exercises(*, sets(*))")
        .eq("user_id", userId);

      if (workoutError) {
        console.error("Supabase query error:", workoutError);
        throw workoutError;
      }
      const { data: userExercises, error } = await supabase
        .from("user_exercises")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }

      if (!workouts) {
        console.log("No workouts found for user");
        return;
      }

      console.log("Syncing", workouts.length, "workouts to IndexedDB");

      await db.transaction(
        "rw",
        [db.workouts, db.exercises, db.sets, db.metadata, db.userExercises],
        async () => {
          // Clear existing data
          await db.workouts.clear();
          await db.exercises.clear();
          await db.sets.clear();
          await db.userExercises.clear();
          for (const exercise of userExercises) {
            await db.userExercises.put({
              ...exercise,
              id: exercise.id,
              synced: true,
            });
          }
          // Insert workouts
          for (const workout of workouts) {
            await db.workouts.put({
              ...workout,
              id: workout.id,
              synced: true,
            });

            // Insert exercises
            if (workout.exercises) {
              for (const exercise of workout.exercises) {
                await db.exercises.put({
                  ...exercise,
                  id: exercise.id,
                  workout_id: exercise.workout_id,
                  workout_date: workout.date,
                  synced: true,
                });

                // Insert sets
                if (exercise.sets) {
                  for (const set of exercise.sets) {
                    await db.sets.put({
                      ...set,
                      id: set.id,
                      exercise_id: set.exercise_id,
                      synced: true,
                    });
                  }
                }
              }
            }
          }

          // Update metadata
          await db.metadata.put({
            key: "lastFullSyncAt",
            value: Date.now().toString(),
          });

          console.log("Initial sync completed successfully");
        }
      );
    } catch (error) {
      console.error("Initial sync failed:", error);
      throw error;
    }
  },
};
