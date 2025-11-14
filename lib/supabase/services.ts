import { Exercise, ExerciseSet, UserExercise, Workout } from "./models";
import { SupabaseClient } from "@supabase/supabase-js";

export const workoutService = {
  async getWorkouts(
    supabase: SupabaseClient,
    userId: string
  ): Promise<Workout[]> {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;

    return data || [];
  },

  async getWorkout(
    supabase: SupabaseClient,
    workoutId: string
  ): Promise<Workout> {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("id", workoutId)
      .single();

    if (error) throw error;

    return data || [];
  },

  async createWorkout(
    supabase: SupabaseClient,
    workout: Omit<Workout, "id" | "created_at" | "exercises" | "user_id">
  ): Promise<Workout> {
    const { data, error } = await supabase
      .from("workouts")
      .insert(workout)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteWorkout(
    supabase: SupabaseClient,
    workoutId: string
  ): Promise<null> {
    const { data, error } = await supabase
      .from("workouts")
      .delete()
      .eq("id", workoutId);

    if (error) throw error;

    return data;
  },

  async updateWorkoutNotes(
    supabase: SupabaseClient,
    workoutId: string,
    notes: string
  ): Promise<null> {
    const { data, error } = await supabase
      .from("workouts")
      .update({ notes })
      .eq("id", workoutId);

    if (error) throw error;

    return data;
  },

  async saveWorkoutWithExercisesAndSets(
    supabase: SupabaseClient,
    workout: Omit<Workout, "id" | "created_at" | "exercises" | "user_id">,
    exercises: Omit<Exercise, "id" | "created_at" | "workout_id">[]
  ) {
    const workoutRow = await this.createWorkout(supabase!, workout);

    const exerciseInsertPayload = exercises.map((ex) => ({
      name: ex.name,
      workout_id: workoutRow.id,
      date: workoutRow.date,
    }));

    const { data: exerciseRows, error: exerciseError } = await supabase
      .from("exercises")
      .insert(exerciseInsertPayload)
      .select();

    const allSets: ExerciseSet[] = [];
    if (exerciseRows) {
      for (const row of exerciseRows) {
        const exercise = exercises.find((ex) => ex.name === row.name);

        exercise?.sets.forEach((set) => {
          allSets.push({
            weight: set.weight,
            reps: set.reps,
            exercise_id: row.id,
          });
        });
      }
    }

    if (exerciseError) throw exerciseError;

    if (allSets.length > 0) {
      const { error: setError } = await supabase.from("sets").insert(allSets);

      if (setError) throw setError;
    }
    return {
      workout: workoutRow,
      exercises: exerciseRows,
      setsInserted: allSets.length,
    };
  },
};

export const exerciseService = {
  async getExercises(
    supabase: SupabaseClient,
    workoutId: string
  ): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("workout_id", workoutId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async getUserExercises(supabase: SupabaseClient, userId: string) {
    const { data, error } = await supabase
      .from("user_exercises")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async getOrCreateExercise(
    supabase: SupabaseClient,
    exercise: Omit<Exercise, "id" | "created_at" | "sets">
  ): Promise<Exercise> {
    // 1. Check if exercise already exists for this workout
    const { data: existing, error: findError } = await supabase
      .from("exercises")
      .select("*")
      .eq("workout_id", exercise.workout_id)
      .eq("name", exercise.name)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      // Found existing exercise → reuse it
      return existing;
    }

    // 2. If not found, create a new one
    return this.createExercise(supabase, exercise);
  },

  async createExercise(
    supabase: SupabaseClient,
    exercise: Omit<Exercise, "id" | "created_at" | "sets">
  ): Promise<Exercise> {
    const { data, error } = await supabase
      .from("exercises")
      .insert(exercise)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteExercise(
    supabase: SupabaseClient,
    exerciseId: string
  ): Promise<null> {
    const { data, error } = await supabase
      .from("exercises")
      .delete()
      .eq("id", exerciseId);

    if (error) throw error;

    return data;
  },

  async getLastExercisesByName(
    supabase: SupabaseClient,
    exerciseName: string,
    userId: string,
    limit: number = 5
  ): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from("exercise_history_grouped")
      .select("*")
      .eq("exercise_name", exerciseName)
      .eq("user_id", userId)
      .order("workout_date", { ascending: false })
      .limit(limit)
      .range(1, 1 + limit);

    if (error) throw error;

    return data;
  },
};

// this service is responsible for adding exercises to a user's list of exercises. IE the list that they'll see in their drop down menu for exercises
export const userExercisesService = {
  async createUserExercise(
    supabase: SupabaseClient,
    exercise: Omit<UserExercise, "id" | "created_at">
  ): Promise<UserExercise> {
    const { data, error } = await supabase
      .from("user_exercises")
      .insert(exercise)
      .select()
      .single();

    if (error) throw error;

    return data;
  },
};

export const setsService = {
  async getSetsByWorkout(
    supabase: SupabaseClient,
    workoutId: string
  ): Promise<ExerciseSet[]> {
    const { data, error } = await supabase
      .from("sets")
      .select(
        `
        *,
        exercises!inner(workout_id)
        `
      )
      .eq("exercises.workout_id", workoutId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createSet(
    supabase: SupabaseClient,
    set: Omit<ExerciseSet, "id" | "created_at" | "updated_at">
  ): Promise<ExerciseSet> {
    const { data, error } = await supabase
      .from("sets")
      .insert(set)
      .select()
      .single();

    if (error) throw error;

    return data;
  },
  async deleteSet(supabase: SupabaseClient, setId: string): Promise<null> {
    const { data, error } = await supabase
      .from("sets")
      .delete()
      .eq("id", setId);

    if (error) throw error;

    return data;
  },
};

export const workoutDataService = {
  async getWorkoutWithExercises(supabase: SupabaseClient, workoutId: string) {
    const [workout, exercises] = await Promise.all([
      workoutService.getWorkout(supabase, workoutId),
      exerciseService.getExercises(supabase, workoutId),
    ]);

    if (!workout) throw new Error("Board not found");

    const sets = await setsService.getSetsByWorkout(supabase, workoutId);

    const exercisesWithSets = exercises.map((exercise) => ({
      ...exercise,
      sets: sets.filter((set) => set.exercise_id === exercise.id),
    }));

    return {
      workout,
      exercisesWithSets,
    };
  },
};
