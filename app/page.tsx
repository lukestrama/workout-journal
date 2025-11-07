"use client";

import Link from "next/link";
import LoginButton from "./components/LoginButton";
import { useUser } from "@clerk/nextjs";
import { useWorkouts } from "@/lib/hooks/useWorkouts";

export default function HomePage() {
  const { user } = useUser()
  const { workouts } = useWorkouts()

  return (
    <main className="p-6">
      {!user ? (
        <LoginButton />
      ): (
        <>
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
        </>
      )}

    </main>
  );
}
