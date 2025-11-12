import {
  exerciseService,
  setsService,
  workoutDataService,
  workoutService,
  userExercisesService,
} from "../supabase/services";
import { useUser } from "@clerk/nextjs";
import { Exercise, UserExercise, Workout } from "../supabase/models";
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

      setExercises((prev) => prev.map((ex) => ex));

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

  async function createSet(
    exercise: Exercise,
    setData: {
      reps: number;
      weight: number;
    }
  ) {
    try {
      const newSet = await setsService.createSet(supabase!, {
        ...setData,
        exercise_id: exercise.id,
      });

      setExercises((prev) => {
        if (prev.findIndex((ex) => ex.id === exercise.id) === -1) {
          return [...prev, { ...exercise, sets: [newSet] }];
        }
        return prev.map((ex) => {
          if (ex.id === exercise.id) {
            return { ...ex, sets: [...ex.sets, newSet] };
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
          sets: exercise.sets.filter((set) => set.id !== setId)
        }));
      })
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
  };
}
