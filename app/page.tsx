"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useWorkouts } from "@/lib/hooks/useWorkouts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Spinner from "./components/Spinner";

export default function HomePage() {
  const { user } = useUser();
  const { workouts, deleteWorkout, loading } = useWorkouts();

  const handleDeleteWorkout = (
    e: React.MouseEvent<HTMLButtonElement>,
    workoutId: string
  ) => {
    e.preventDefault();
    deleteWorkout(workoutId);
  };

  return (
    <main className="p-6">
      {!user ? (
        <></>
      ) : (
        <>
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
                      <CardHeader>
                        <CardTitle>{w.title}</CardTitle>
                        <CardDescription>{w.date}</CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button
                          onClick={(e) => handleDeleteWorkout(e, w.id)}
                          variant={"destructive"}
                        >
                          Delete
                        </Button>
                      </CardFooter>
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
