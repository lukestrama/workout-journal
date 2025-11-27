export interface ExerciseSet {
  weight: number;
  reps: number;
  exercise_id: number;
  notes?: string;
  id: number | null;
  temporaryId?: number;
}

export interface Exercise {
  id: number | null;
  name: string;
  sets: ExerciseSet[];
  workout_id: number;
  workout_date?: string;
  temporaryId?: number;
}

export interface Workout {
  id: number;
  title: string;
  date: string;
  exercises: Exercise[];
  user_id: string;
  notes?: string;
  type: string;
}

export interface UserExercise {
  id: number;
  name: string;
  user_id: string;
}
