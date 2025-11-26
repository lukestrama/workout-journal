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
            });
          }
          // Insert workouts
          for (const workout of workouts) {
            await db.workouts.put({
              ...workout,
              id: workout.id,
            });

            // Insert exercises
            if (workout.exercises) {
              for (const exercise of workout.exercises) {
                await db.exercises.put({
                  ...exercise,
                  id: exercise.id,
                  workout_id: exercise.workout_id,
                });

                // Insert sets
                if (exercise.sets) {
                  for (const set of exercise.sets) {
                    await db.sets.put({
                      ...set,
                      id: set.id,
                      exercise_id: set.exercise_id,
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
    workoutId: string,
    userId: string
  ): Promise<Workout> {
    const { data, error } = await supabase.rpc(
      "get_workout_with_neighbors_flat",
      {
        p_workout_id: workoutId,
        p_user_id: userId,
      }
    );

    if (error) throw error;

    return data;
  },

  async createWorkout(
    supabase: SupabaseClient,
    workout: Omit<
      Workout,
      "id" | "created_at" | "exercises" | "lastWorkoutId" | "nextWorkoutId"
    >
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
    workoutId: string,
    userId: string,
    exercises: Omit<Exercise, "created_at" | "workout_id">[]
  ) {
    const workout = await this.getWorkout(supabase, workoutId, userId);

    if (!workout) return;

    const exercisesUpdated = exercises.filter((ex) => ex.id !== null);

    const exerciseInsertPayload = exercises
      .filter((ex) => ex.id === null)
      .map((ex) => ({
        name: ex.name,
        workout_id: workout.id,
        date: workout.date,
      }));

    const { data: exerciseRows, error: exerciseError } = await supabase
      .from("exercises")
      .insert(exerciseInsertPayload)
      .select();

    const allSets: Omit<ExerciseSet, "id">[] = [];
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
    if (exercisesUpdated) {
      for (const row of exercisesUpdated) {
        const exercise = exercises.find((ex) => ex.name === row.name);

        exercise?.sets
          .filter((set) => set.id === null)
          .forEach((set) => {
            allSets.push({
              weight: set.weight,
              reps: set.reps,
              exercise_id: row.id!,
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
    limit: number = 4
  ): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from("exercise_history_grouped")
      .select("*")
      .eq("exercise_name", exerciseName)
      .eq("user_id", userId)
      .order("workout_date", { ascending: false })
      .limit(limit);

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
  async getWorkoutWithExercises(
    supabase: SupabaseClient,
    workoutId: string,
    userId: string
  ) {
    const [workout, exercises] = await Promise.all([
      workoutService.getWorkout(supabase, workoutId, userId),
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
