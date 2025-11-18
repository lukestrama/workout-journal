import {
  exerciseService,
  setsService,
  workoutDataService,
  workoutService,
  userExercisesService,
} from "../supabase/services";
import { useUser } from "@clerk/nextjs";
import { Exercise, hasTempId, UserExercise, Workout } from "../supabase/models";
import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "../supabase/SupabaseProvider";

export function useWorkout(workoutId: string) {
  const { user } = useUser();
  const { supabase } = useSupabase();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [userExercises, setUserExercises] = useState<UserExercise[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>("");

  const loadWorkout = useCallback(async () => {
    if (!workoutId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await workoutDataService.getWorkoutWithExercises(
        supabase!,
        workoutId
      );

      setWorkout(data.workout);
      setExercises(data.exercisesWithSets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workout.");
    } finally {
      setLoading(false);
    }
  }, [workoutId, supabase]);

  useEffect(() => {
    if (workoutId) {
      loadWorkout();
    }
  }, [workoutId, supabase, loadWorkout]);

  async function createOrGetExercise(
    name: string
  ): Promise<Exercise | undefined> {
    if (!workout || !user) throw new Error("Workout not loaded");
    try {
      const exercise = await exerciseService.getOrCreateExercise(supabase!, {
        name,
        workout_id: workout.id,
      });

      setExercises((prev) => {
        if (prev.findIndex((ex: Exercise) => ex.id === exercise.id) === -1) {
          return [...prev.map((ex) => ex), exercise];
        }
        return prev;
      });

      return exercise;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create exercise."
      );
    }
  }

  async function createUserExercise(name: string) {
    if (!workout || !user) throw new Error("Workout not loaded");

    try {
      const newExercise = await userExercisesService.createUserExercise(
        supabase!,
        {
          name,
          user_id: user.id,
        }
      );

      return newExercise;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create exercise."
      );
    }
  }

  const loadUserExercises = useCallback(async () => {
    if (!workoutId || !user) return;

    try {
      setLoading(true);
      setError(null);
      const userExercises = await exerciseService.getUserExercises(
        supabase!,
        user.id
      );
      setUserExercises(userExercises);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workout.");
    } finally {
      setLoading(false);
    }
  }, [supabase, user, workoutId]);

  useEffect(() => {
    if (user) {
      loadUserExercises();
    }
  }, [user, loadUserExercises]);

  async function saveWorkout(workoutId: string, exercises: Exercise[]) {
    if (!user) return;
    try {
      await workoutService.saveWorkoutWithExercisesAndSets(
        supabase!,
        workoutId,
        exercises
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete the set."
      );
    }
  }
  async function createSet(
    exercise: Exercise & hasTempId,
    setData: {
      reps: number;
      weight: number;
    }
  ) {
    try {
      const newSet = await setsService.createSet(supabase!, {
        ...setData,
        exercise_id: (exercise.id || exercise.temporaryId)!,
      });

      setExercises((prev) => {
        if (prev.findIndex((ex) => ex.id === exercise.id) === -1) {
          return [...prev, { ...exercise, sets: [newSet] }];
        }
        return prev.map((ex) => {
          if (ex.id === exercise.id) {
            const sets = ex.sets?.length ? [...ex.sets, newSet] : [newSet];
            return { ...ex, sets };
          } else {
            return ex;
          }
        });
      });

      return newSet;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create the set."
      );
    }
  }

  async function deleteSet(setId: string) {
    try {
      await setsService.deleteSet(supabase!, setId);
      setExercises((prev) => {
        return prev.map((exercise) => ({
          ...exercise,
          sets: exercise.sets.filter((set) => set.id !== setId),
        }));
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete the set."
      );
    }
  }

  async function deleteExercise(exerciseId: string) {
    try {
      await exerciseService.deleteExercise(supabase!, exerciseId);
      setExercises((prev) => {
        return prev.filter((exercise) => exercise.id !== exerciseId);
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete the set."
      );
    }
  }

  async function updateNotes(workoutId: string, notes: string) {
    try {
      await workoutService.updateWorkoutNotes(supabase!, workoutId, notes);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete the set."
      );
    }
  }

  return {
    workout,
    loading,
    error,
    exercises,
    userExercises,
    createSet,
    createUserExercise,
    createOrGetExercise,
    deleteSet,
    deleteExercise,
    updateNotes,
    setExercises,
    saveWorkout,
  };
}
