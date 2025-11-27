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
  workouts!: Table<Workout, string>;
  exercises!: Table<Exercise, string>;
  sets!: Table<ExerciseSet, string>;
  userExercises!: Table<UserExercise, string>;
  metadata!: Table<SyncMetadata, string>;

  constructor() {
    super("workoutdb");

    this.version(1).stores({
      workouts: "id, user_id, date, type",
      exercises: "id, workout_id, name",
      sets: "id, exercise_id",
      userExercises: "id, user_id, name",
      metadata: "key, value",
    });
  }
}

export const db = new MyDB();
