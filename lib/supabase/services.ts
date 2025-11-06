import { Workout } from "./models";
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