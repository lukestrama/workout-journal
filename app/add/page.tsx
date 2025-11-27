"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkouts } from "@/lib/hooks/useWorkouts";
import { Workout } from "@/lib/supabase/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "../components/Header";
import { WORKOUT_TYPES } from "@/lib/constants";
import Select from "react-select";
import { selectStyles } from "@/lib/utils";

export default function AddWorkoutPage() {
  const router = useRouter();
  const { createWorkout } = useWorkouts();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("other");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const workoutId = await createWorkout(title, date, type);
    router.push(`/workout/${workoutId}`);
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
        <Select
          options={WORKOUT_TYPES}
          onChange={(e) => setType(e?.value ? e.value : "other")}
          classNames={selectStyles}
        />
        <Button onClick={handleSave} disabled={loading}>
          Save Workout
        </Button>
      </div>
    </main>
  );
}
