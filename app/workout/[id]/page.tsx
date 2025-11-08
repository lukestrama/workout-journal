"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ExerciseSet, Exercise, Workout } from "@/lib/supabase/models";
import Link from "next/link";
import { useWorkout } from "@/lib/hooks/useWorkouts";

const defaultWeight = 0
const defaultReps = 0

export default function WorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const { workout, exercises, createSet, createExercise } = useWorkout(id)

  const [exerciseName, setExerciseName] = useState("");
  const [reps, setReps] = useState<number>(defaultWeight);
  const [weight, setWeight] = useState<number>(defaultReps);


  const addSet = async () => {
    if (!workout) return;

    const exercise = await createExercise(exerciseName)

    if (exercise) {
      createSet(exercise.id, { reps, weight })
    }
    
    setWeight(defaultWeight);
    setReps(defaultReps);
  };

  if (!workout) return <p>Loading...</p>;

  return (
    <main className="p-6">
      <div className="flex items-center mb-4 gap-2">
        <Link href='/'><i className="fa-solid fa-chevron-left text-2xl"></i></Link>
        <h1 className="text-2xl font-bold">{workout.title}</h1>
      </div>
      <h2 className="mb-4 text-gray-600">{workout.date}</h2>

      <div className="space-y-3 mb-6">
        <label>Exercise</label>
        <input
          className="border p-2 w-full"
          placeholder="Exercise name"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          />
        <label>Weight</label>
        <input
          className="border p-2 w-full"
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        /> X
        <input
          className="border p-2 w-full"
          type="number"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(Number(e.target.value))}
        />
        <button
          onClick={addSet}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Set
        </button>
      </div>

      <h3 className="font-bold mb-2">Exercises</h3>
      <ul className="space-y-2">
        {exercises.length ? (
          exercises.map((ex) => (
            <li key={ex.id}>
              {ex.name} - 
              {ex.sets?.map((set, idx) => (
                <span key={set.id}>{idx > 0 ? ', ' : ' '}{set.weight}x{set.reps}</span>
              ))}
            </li>
          ))
        ) : ''}
      </ul>
    </main>
  );
}
