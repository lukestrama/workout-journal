"use client";
import Dexie, { Table } from "dexie";
import {
  Workout,
  Exercise,
  ExerciseSet,
  UserExercise,
} from "./supabase/models";

export interface SyncMetadata {
  key: string;
  value: string;
}

export class MyDB extends Dexie {
  workouts!: Table<Workout, number>;
  exercises!: Table<Exercise, number>;
  sets!: Table<ExerciseSet, number>;
  userExercises!: Table<UserExercise, number>;
  metadata!: Table<SyncMetadata, string>;

  constructor() {
    super("workoutdb");

    this.version(1).stores({
      workouts: "id, user_id, date, type, synced",
      exercises: "id, workout_id, name, synced",
      sets: "id, exercise_id, synced",
      userExercises: "id, user_id, name, synced",
      metadata: "key, value",
    });
  }
}

export const db = new MyDB();
