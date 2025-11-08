export interface ExerciseSet {
    weight: number,
    reps: number,
    exercise_id: string
    notes?: string
}

export interface Exercise {
    id: string;
    name: string;
    sets: ExerciseSet[];
    workout_id: string;
}

export interface Workout {
    id: string;
    title: string;
    date: string;
    exercises: Exercise[];
    user_id: string;
}