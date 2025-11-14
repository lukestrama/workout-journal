import { useSupabase } from "../supabase/SupabaseProvider";
import { exerciseService } from "../supabase/services";
import { useState, useEffect } from "react";
import { Exercise } from "../supabase/models";
import { useUser } from "@clerk/nextjs";

export function useExercise(exercise: Exercise) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [error, setError] = useState<string | null>("");
  const [lastExercises, setLastExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (!exercise || !supabase || !user) return;

    let isCancelled = false;

    const fetchExercises = async () => {
      try {
        const workouts = await exerciseService.getLastExercisesByName(
          supabase,
          exercise.name,
          user.id
        );

        if (!isCancelled) {
          setLastExercises(workouts);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to retrieve the exercises."
          );
        }
      }
    };

    fetchExercises();

    return () => {
      isCancelled = true;
    };
  }, [exercise, supabase, user]);

  return { lastExercises, error };
}
