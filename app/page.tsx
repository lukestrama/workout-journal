"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useWorkouts } from "@/lib/hooks/useWorkouts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Spinner from "./components/Spinner";
import { workoutService } from "@/lib/supabase/services";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";

export default function HomePage() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const { workouts, deleteWorkout, loading } = useWorkouts();

  const handleDeleteWorkout = (
    e: React.MouseEvent<HTMLButtonElement>,
    workoutId: string
  ) => {
    e.preventDefault();
    deleteWorkout(workoutId);
  };

  const handleAddNewDummyWorkout = () => {
    workoutService.saveWorkoutWithExercisesAndSets(
      supabase!,
      {
        date: "11-15-2025",
        title: "Here we go",
        user_id: user.id,
      },
      [
        {
          name: "A",
          sets: [
            { reps: 5, weight: 6 },
            { reps: 5, weight: 6 },
            { reps: 5, weight: 6 },
          ],
        },
        {
          name: "B",
          sets: [
            { reps: 5, weight: 6 },
            { reps: 5, weight: 6 },
            { reps: 5, weight: 6 },
          ],
        },
        {
          name: "C",
          sets: [
            { reps: 5, weight: 6 },
            { reps: 5, weight: 6 },
            { reps: 5, weight: 6 },
          ],
        },
      ]
    );
  };

  return (
    <main className="p-6">
      {!user ? (
        <></>
      ) : (
        <>
          <button onClick={handleAddNewDummyWorkout}>Here we go</button>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Workouts</h1>
            <Button asChild>
              <Link href="/add">Add workout</Link>
            </Button>
          </div>
          {/* TODO: Deal with flicker here. No workouts shows first before spinner */}
          {workouts.length === 0 ? (
            loading ? (
              <Spinner />
            ) : (
              <p>No workouts yet. Add one!</p>
            )
          ) : (
            <ul className="space-y-2">
              {workouts.map((w) => (
                <li key={w.id} className="my-4">
                  <Link href={`/workout/${w.id}`} className="text-lg">
                    <Card>
                      <CardHeader className="flex justify-between">
                        <div>
                          <CardTitle>{w.title}</CardTitle>
                          <CardDescription>{w.date}</CardDescription>
                        </div>
                        <Button
                          onClick={(e) => handleDeleteWorkout(e, w.id)}
                          variant={"destructive"}
                        >
                          Delete
                        </Button>
                      </CardHeader>
                    </Card>
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
