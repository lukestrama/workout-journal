import { localSyncService, workoutService } from "../supabase/services";
import { useUser } from "@clerk/nextjs";
import { Workout } from "../supabase/models";
import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "../supabase/SupabaseProvider";
import { db } from "../db";

export function useWorkouts() {
  const { user } = useUser();
  const { supabase } = useSupabase();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>("");

  // Extract stable user ID to prevent unnecessary re-renders on session refresh
  const userId = user?.id;

  const initialDataSync = useCallback(async () => {
    if (!userId) return;
    await localSyncService.fullInitialSync(userId, supabase!);
  }, [userId, supabase]);

  const loadWorkouts = useCallback(async () => {
    if (!userId) return;
    try {
      // Returns all workouts sorted by date ascending
      const workouts = await db.workouts.orderBy("date").reverse().toArray();
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

  async function createWorkout(
    title: string,
    date: string,
    type: string
  ): Promise<string | void> {
    if (!userId) throw Error("Must be signed in to create a workout");

    try {
      setLoading(true);
      const workoutId = await db.workouts.put({
        title,
        date,
        type,
        exercises: [],
        user_id: userId,
        id: crypto.randomUUID(),
      });

      setWorkouts(await db.workouts.orderBy("date").reverse().toArray());

      return workoutId;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create workout"
      );
    }
  }

  async function deleteWorkout(workoutId: string) {
    if (!workoutId) return;

    try {
      await workoutService.deleteWorkout(supabase!, workoutId);
      setWorkouts((prev) => prev.filter((ex) => ex.id !== workoutId));
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
