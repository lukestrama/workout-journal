"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { loadWorkouts, saveWorkouts } from "@/lib/storage";
import { ExerciseSet,Exercise, Workout } from "../../../types/workout";
import { v4 as uuid } from "uuid";

export default function WorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exerciseName, setExerciseName] = useState("");
  const [reps, setReps] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  
  // TODO: Move this out of a useEffect
  useEffect(() => { 
    const workouts = loadWorkouts();
    const found = workouts.find((w) => w.id === id);
    if (found) setWorkout(found); 
  }, [id]);

  const addSet = () => {
    if (!workout) return;
    const newSet: ExerciseSet = {
      weight: weight || 0,
      reps: reps || 0
    }
    
    let existingExercise = workout.exercises.find(ex => ex.name === exerciseName);
    let all: Workout[], updated: Workout;
    if (existingExercise) {
      // keep everything as is, add the new set
      existingExercise = { ...existingExercise, sets: [...existingExercise.sets, newSet] };
      
      const updatedExercises: Exercise[] = workout.exercises.map(ex => ex.name === exerciseName ? existingExercise! : ex);
      updated = { ...workout, exercises: updatedExercises };
      all = loadWorkouts().map((w) => (w.id === id ? updated : w));
    } else {
      const newExercise: Exercise = {
        id: uuid(),
        name: exerciseName,
        sets: [newSet]
      };

      updated = { ...workout, exercises: [...workout.exercises, newExercise] };
      all = loadWorkouts().map((w) => (w.id === id ? updated : w));
    }
    
    saveWorkouts(all);
    setWorkout(updated);
    setWeight(0);
    setReps(0);
  };

  if (!workout) return <p>Loading...</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">{workout.title}</h1>
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
        {workout.exercises.map((ex) => (
          <li key={ex.id}>
            {ex.name} - 
            {ex.sets.map((set, idx) => (
              <span key={idx}>{idx > 0 ? ', ' : ' '}{set.weight}x{set.reps}</span>
            ))}
          </li>
        ))}
      </ul>
    </main>
  );
}
