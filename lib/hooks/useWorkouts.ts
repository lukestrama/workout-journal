import { workoutService } from "../supabase/services"
import { useUser } from "@clerk/nextjs"
import { Workout } from "../supabase/models"
import { useState } from "react"
import { useSupabase } from "../supabase/SupabaseProvider"

export function useWorkouts() {
    const { user } = useUser()
    const [workouts, setWorkouts] = useState<Workout[]>([])
    const { supabase } = useSupabase()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')

    async function createWorkout(title: string, date: string) {
        
        if (!user) throw Error('Must be signed in to create a workout')
        try {
            const workout = await workoutService.createWorkout(supabase!, { title, date, user_id: user.id })
            setWorkouts((prev) => [workout, ...prev])
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to create workout")
        }
    }
    return { workouts, loading, error, createWorkout }
}