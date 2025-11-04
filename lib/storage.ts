import { Workout } from "@/types/workout";

const STORAGE_KEY = "workouts";

export function loadWorkouts(): Workout[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveWorkouts(workouts: Workout[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

