import { workoutDataService, workoutService } from "../supabase/services"
import { useUser } from "@clerk/nextjs"
import { Exercise, Workout } from "../supabase/models"
import { useEffect, useState, useCallback } from "react"
import { useSupabase } from "../supabase/SupabaseProvider"

export function useWorkouts() {
    const { user } = useUser()
    const { supabase } = useSupabase()

    const [workouts, setWorkouts] = useState<Workout[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>('')
   
    const loadWorkouts = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true)
            setError(null)
            const data = await workoutService.getWorkouts(supabase!, user.id)
            setWorkouts(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load workouts.")
        } finally {
            setLoading(false)
        }
    }, [user, supabase])

     useEffect(() => {
        if (user) {
            loadWorkouts()
        }
    }, [user, supabase, loadWorkouts])

    async function createWorkout(title: string, date: string) {
        
        if (!user) throw Error('Must be signed in to create a workout')
        try {
            setLoading(true)
            const workout = await workoutService.createWorkout(supabase!, { title, date, user_id: user.id })
            setWorkouts((prev) => [workout, ...prev])
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to create workout")
        }
    }
    return { workouts, loading, error, createWorkout }
}

export function useWorkout(workoutId: string) {
    const { user } = useUser()
    const { supabase } = useSupabase()


    const [workout, setWorkout] = useState<Workout | null>(null)
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>('')

    const loadWorkout = useCallback(async () => {
        if (!workoutId) return;

        try {
            setLoading(true);
            setError(null)
            const data = await workoutDataService.getWorkoutWithExercises(supabase!, workoutId)

            setWorkout(data.workout)
            setExercises(data.exercisesWithSets)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load workout.");
        } finally {
            setLoading(false);
        }
    }, [workoutId, supabase])

    useEffect(() => {
        if (workoutId) {
            loadWorkout();
        }
    }, [workoutId, supabase, loadWorkout])

    return { workout, loading, error, exercises }
}