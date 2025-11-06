import { createClient } from "@/lib/supabase/client"
import { Workout } from "./models";

const supabase = createClient()

export const workoutService = {
    async getWorkouts(userId: string): Promise<Workout[]> {
        const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

        if (error) throw error;

        return data || []
    },

    async createWorkout(workout: Omit<Workout, 'id' | 'created_at' | 'exercises'>): Promise<Workout> {
        const { data, error } = await supabase
        .from("workouts")
        .insert(workout)
        .select()
        .single()


        if (error) throw error;

        return data
    }
}