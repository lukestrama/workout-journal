"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Workout } from "@/lib/supabase/models";
import LoginButton from "./components/LoginButton";
import { workoutService } from "@/lib/supabase/services";
import { createClient } from '@/lib/supabase/client'
import { useWorkouts } from "@/lib/hooks/useWorkouts";
import { type User } from "@supabase/supabase-js";

export default function HomePage() {
  const getUser = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    
    fetchUser();
  }, []);
  
  return (
    <main className="p-6">
      {user ? (
        <>
          <h1 className="text-2xl font-bold mb-4">🏋️ My Workouts</h1>
          <Link href="/add" className="text-blue-500 underline mb-4 block">
            ➕ Add new workout
          </Link>
        </>
      ): (
        <LoginButton />
      )}

      {/* {workouts.length === 0 ? (
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
      )} */}
    </main>
  );
}
