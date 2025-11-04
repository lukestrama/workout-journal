"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadWorkouts, saveWorkouts } from "@/lib/storage";
import { Workout } from "@/types/workout";
import { v4 as uuid } from "uuid";

export default function AddWorkoutPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const handleSave = () => {
    const workouts = loadWorkouts();
    const newWorkout: Workout = {
      id: uuid(),
      title,
      date,
      exercises: [],
    };
    saveWorkouts([...workouts, newWorkout]);
    router.push(`/workout/${newWorkout.id}`);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Workout</h1>

      <div className="space-y-4">
        <input
          className="border p-2 w-full"
          placeholder="Workout title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 w-full"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Workout
        </button>
      </div>
    </main>
  );
}
