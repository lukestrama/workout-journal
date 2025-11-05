export interface ExerciseSet {
  weight: number,
  reps: number,
  notes?: string
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface Workout {
  id: string;
  title: string;
  date: string;
  exercises: Exercise[];
}
