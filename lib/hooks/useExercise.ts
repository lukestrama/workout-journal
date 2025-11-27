import { useSupabase } from "../supabase/SupabaseProvider";
import { useState, useEffect } from "react";
import { Exercise } from "../supabase/models";
import { useUser } from "@clerk/nextjs";
import { db } from "../db";

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
        const workouts = await db.exercises
          .where("name")
          .equals(exercise.name)
          .toArray();

        workouts.sort((a, b) => {
          if (a.workout_date && b.workout_date) {
            return (
              new Date(b.workout_date).getTime() -
              new Date(a.workout_date).getTime()
            );
          }
          return 0;
        });

        if (!isCancelled && workouts.length) {
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
