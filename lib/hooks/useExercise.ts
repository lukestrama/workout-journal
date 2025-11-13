import { useSupabase } from "../supabase/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { exerciseService } from "../supabase/services";
import { useCallback, useState, useEffect } from "react";
import { Exercise } from "../supabase/models";

export function useExercise(exercise: Exercise) {
  const { supabase } = useSupabase();
  const [error, setError] = useState<string | null>("");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const getLastExercises = useCallback(async () => {
    if (!exercise) return;
    try {
      const workouts = await exerciseService.getLastExercisesByName(
        supabase!,
        exercise.name
      );

      setExercises(workouts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to retrieve the exercises."
      );
    }
  }, [exercise, supabase]);

  useEffect(() => {
    if (exercise) {
      getLastExercises();
    }
  }, [exercise, getLastExercises, supabase]);

  return { exercises, error };
}
