"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkouts } from "@/lib/hooks/useWorkouts";
import { Workout } from "@/lib/supabase/models";

export default function AddWorkoutPage() {
  const router = useRouter();
  const { createWorkout } = useWorkouts()

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");


  const handleSave = async () => {
    const workout: Workout | undefined = await createWorkout(title, date)
    if (workout) router.push(`/workout/${workout.id}`)
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
