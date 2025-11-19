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
import Spinner from "../components/Spinner";
import Dialog from "../components/Dialog";

export default function WorkoutsPage() {
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
        <Spinner />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Workouts</h1>
            <Button asChild>
              <Link href="/add">Add workout</Link>
            </Button>
          </div>
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
                  <div className="relative">
                    <Link href={`/workout/${w.id}`} className="text-lg flex-1">
                      <Card>
                        <CardHeader className="flex justify-between">
                          <div>
                            <CardTitle>{w.title}</CardTitle>
                            <CardDescription>{w.date}</CardDescription>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                    <Dialog
                      triggerClasses="absolute right-[20px] top-[30%]"
                      buttonText="Delete"
                      titleText="Delete workout?"
                      triggerButtonVariant={"destructive"}
                    >
                      <div className="text-center">
                        <p className="mb-3 text-lg">
                          Are you sure you want to delete your workout?
                        </p>
                        <Button
                          onClick={(e) => handleDeleteWorkout(e, w.id)}
                          variant={"destructive"}
                        >
                          Delete
                        </Button>
                      </div>
                    </Dialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
