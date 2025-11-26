import { localSyncService, workoutService } from "../supabase/services";
import { useUser } from "@clerk/nextjs";
import { Workout } from "../supabase/models";
import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "../supabase/SupabaseProvider";

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
      setLoading(true);
      setError(null);
      const data = await workoutService.getWorkouts(supabase!, userId);
      setWorkouts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workouts.");
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    if (userId) {
      loadWorkouts();
    }
  }, [userId, loadWorkouts]);

  async function createWorkout(
    title: string,
    date: string,
    type: string
  ): Promise<Workout | undefined> {
    if (!userId) throw Error("Must be signed in to create a workout");
    let workout: Workout;

    try {
      setLoading(true);
      workout = await workoutService.createWorkout(supabase!, {
        title,
        date,
        type,
        user_id: userId,
      });

      setWorkouts((prev) => [workout, ...prev]);

      return workout;
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
