import { workoutService } from "../supabase/services"

export function useWorkouts() {
    async function createWorkout(title: string, date: string, userId: string) {
        
        return workoutService
            .createWorkout({ title, date, user_id: userId })
    }
    return { createWorkout }
}