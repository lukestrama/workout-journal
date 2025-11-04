"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadWorkouts } from "@/lib/storage";
import { Workout } from "@/types/workout";
import LoginButton from "./components/LoginButton";

export default function HomePage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [user, setUser] = useState(null)

  useEffect(() => {
    setWorkouts(loadWorkouts());
  }, []);

  return (
    <main className="p-6">
      <LoginButton />
      <h1 className="text-2xl font-bold mb-4">🏋️ My Workouts</h1>

      <Link href="/add" className="text-blue-500 underline mb-4 block">
        ➕ Add new workout
      </Link>

      {workouts.length === 0 ? (
        <p>No workouts yet. Add one!</p>
      ) : (
        <ul className="space-y-2">
          {workouts.map((w) => (
            <li key={w.id}>
              <Link href={`/workout/${w.id}`} className="text-lg text-gray-800 underline">
                {w.title} ({w.date})
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
