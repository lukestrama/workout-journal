export interface ExerciseSet {
  weight: number;
  reps: number;
  exercise_id: string;
  notes?: string;
  id: string | null;
  temporaryId?: string;
}

export interface Exercise {
  id: string | null;
  name: string;
  sets: ExerciseSet[];
  workout_id: string;
  workout_date?: string;
  temporaryId?: string;
}

export interface Workout {
  id: string;
  title: string;
  date: string;
  exercises: Exercise[];
  user_id: string;
  notes?: string;
  type: string;
  lastWorkoutId: string | null;
  nextWorkoutId: string | null;
}

export interface UserExercise {
  id: string;
  name: string;
  user_id: string;
}
