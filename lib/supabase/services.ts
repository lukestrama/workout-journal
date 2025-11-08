import { Exercise, ExerciseSet, Workout } from "./models";
import { SupabaseClient } from "@supabase/supabase-js";

export const workoutService = {
    async getWorkouts(supabase: SupabaseClient, userId: string): Promise<Workout[]> {
        const { data, error } = await supabase
            .from("workouts")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })

        if (error) throw error;

        return data || []
    },

    async getWorkout(supabase: SupabaseClient, workoutId: string): Promise<Workout> {
        const { data, error } = await supabase
            .from("workouts")
            .select("*")
            .eq("id", workoutId)
            .single()

        if (error) throw error;

        return data || []
    },

    async createWorkout(supabase: SupabaseClient, workout: Omit<Workout, 'id' | 'created_at' | 'exercises'>): Promise<Workout> {
        const { data, error } = await supabase
            .from("workouts")
            .insert(workout)
            .select()
            .single()


        if (error) throw error;

        return data
    }

}

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

    async getOrCreateExercise(supabase: SupabaseClient, exercise: Omit<Exercise, 'id' | 'created_at' | 'sets'>): Promise<Exercise> {
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
        return this.createExercise(supabase, exercise)
    },

    async createExercise(supabase: SupabaseClient, exercise: Omit<Exercise, 'id' | 'created_at' | 'sets'>): Promise<Exercise> {
        const { data, error } = await supabase
            .from("exercises")
            .insert(exercise)
            .select()
            .single()

        if (error) throw error;

        return data
    }
}

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
        console.log(set, "hejka")
        const { data, error } = await supabase
            .from("sets")
            .insert(set)
            .select()
            .single();

        if (error) throw error;

        return data;
    },
}

export const workoutDataService = {
    async getWorkoutWithExercises(supabase: SupabaseClient, workoutId: string) {
        const [workout, exercises] = await Promise.all([
            workoutService.getWorkout(supabase, workoutId),
            exerciseService.getExercises(supabase, workoutId)
        ])

        if (!workout) throw new Error("Board not found");

        const sets = await setsService.getSetsByWorkout(supabase, workoutId);

        const exercisesWithSets = exercises.map((exercise) => ({
            ...exercise,
            sets: sets.filter(set => set.exercise_id === exercise.id)
        }))

        return {
            workout, exercisesWithSets
        }
    }
}