"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkouts } from "@/lib/hooks/useWorkouts";
import { Workout } from "@/lib/supabase/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "../components/Header";

export default function AddWorkoutPage() {
  const router = useRouter();
  const { createWorkout } = useWorkouts();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const workout: Workout | undefined = await createWorkout(title, date);
    if (workout) router.push(`/workout/${workout.id}`);
    setLoading(false);
  };

  return (
    <main className="p-6">
      <Header title="Add New Workout" />

      <div className="space-y-4">
        <Input
          className="border p-2 w-full"
          placeholder="Workout title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          type="date"
          className="border p-2 w-full"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Button onClick={handleSave} disabled={loading}>
          Save Workout
        </Button>
      </div>
    </main>
  );
}
