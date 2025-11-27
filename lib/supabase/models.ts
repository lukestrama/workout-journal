export interface ExerciseSet {
  weight: number;
  reps: number;
  exercise_id: number;
  notes?: string;
  id: number;
  temporaryId?: number;
  synced?: boolean;
  deleted?: boolean;
}

export interface Exercise {
  id: number;
  name: string;
  sets?: ExerciseSet[];
  workout_id: number;
  workout_date?: string;
  temporaryId?: number;
  synced?: boolean;
  deleted?: boolean;
}

export interface Workout {
  id: number;
  title: string;
  date: string;
  exercises?: Exercise[];
  user_id: string;
  notes?: string;
  type: string;
  synced?: boolean;
  deleted?: boolean;
}

export interface UserExercise {
  id: number;
  name: string;
  user_id: string;
  synced?: boolean;
}
