import { workoutService } from "../supabase/services";
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

  const loadWorkouts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await workoutService.getWorkouts(supabase!, user.id);
      setWorkouts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workouts.");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      loadWorkouts();
    }
  }, [user, supabase, loadWorkouts]);

  async function createWorkout(
    title: string,
    date: string
  ): Promise<Workout | undefined> {
    if (!user) throw Error("Must be signed in to create a workout");
    let workout: Workout;

    try {
      setLoading(true);
      workout = await workoutService.createWorkout(supabase!, {
        title,
        date,
        user_id: user.id,
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

  return { workouts, loading, error, createWorkout, deleteWorkout };
}
