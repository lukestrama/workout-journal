"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Workout } from "@/lib/supabase/models";
import { useWorkouts } from "@/lib/hooks/useWorkouts";
import { createClient } from "@/lib/supabase/client";
import { type User } from '@supabase/supabase-js'

export default function AddWorkoutPage() {
  const router = useRouter();
  const user = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const { createWorkout } = useWorkouts()

  const handleSave = async () => {
    const u = await user()
    if (u) {
      createWorkout(title, date, u.id)
    }
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
