"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  Exercise,
  ExerciseSet,
  Workout,
  UserExercise,
} from "@/lib/supabase/models";
import CreatableSelect from "react-select/creatable";
import { SingleValue, ActionMeta } from "react-select";
import { Button } from "@/components/ui/button";
import ExerciseRow from "@/app/components/exercises/ExerciseRow";
import { Header } from "@/app/components/Header";
import Spinner from "@/app/components/Spinner";
import getAddMode from "./utils/getAddMode";
import { ADD_MODES } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import AddWeightReps from "./components/AddWeightReps";
import { selectStyles } from "@/lib/utils";
import { useConnectionStatus } from "@/lib/hooks/useConnectionStatus";
import { useUser } from "@clerk/nextjs";

const defaultWeight = 0;
const defaultReps = 0;

export default function WorkoutPage() {
  const router = useRouter();
  const { isOnline } = useConnectionStatus();
  const { user } = useUser();
  const { id } = useParams<{ id: string }>();

  // Replace useWorkout with direct state management
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [userExercises, setUserExercises] = useState<UserExercise[]>([]);
  const [loading, setLoading] = useState(true);

  const [exerciseName, setExerciseName] = useState("");
  const [reps, setReps] = useState<number>(defaultReps);
  const [weight, setWeight] = useState<number>(defaultWeight);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load workout and exercises from Dexie
  useEffect(() => {
    const loadWorkoutData = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);
        const workoutId = parseInt(id);

        // Load workout
        const workoutData = await db.workouts.get(workoutId);
        if (workoutData) {
          setWorkout(workoutData);
        }

        // Load exercises for this workout
        const exerciseData = await db.exercises
          .where("workout_id")
          .equals(workoutId)
          .toArray();

        // Load sets for each exercise
        const exercisesWithSets = await Promise.all(
          exerciseData.map(async (exercise) => {
            const sets = await db.sets
              .where("exercise_id")
              .equals(exercise.id!)
              .toArray();
            return { ...exercise, sets };
          })
        );

        setExercises(exercisesWithSets);

        // Load user exercises
        const userExerciseData = await db.userExercises
          .where("user_id")
          .equals(user.id)
          .toArray();

        userExerciseData.sort((a, b) => a.name.localeCompare(b.name));

        setUserExercises(userExerciseData);
      } catch (error) {
        console.error("Failed to load workout data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkoutData();
  }, [id, user]);
  /**
   * the idea here is that if we have an exercise that has already
   * been added to the workout, we should be in addSetMode. If the
   * exercise has not been added, then we should be in
   * addExerciseMode. The add button is disabled if we're in add set
   * mode but don't have reps, or in exercise mode and
   * we don't have an exercise name selected
   */
  const currentMode = getAddMode(exercises, exerciseName, reps);
  const addSetMode = currentMode === ADD_MODES.set;
  const addExerciseMode = currentMode === ADD_MODES.exercise;

  const addButtonDisabled =
    (addSetMode && !reps) || (addExerciseMode && !exerciseName);

  const handleSetExerciseName = async (
    option: SingleValue<{ value: string; label: string }>,
    { action }: ActionMeta<{ value: string; label: string }>
  ): Promise<void> => {
    if (action === "create-option" && option?.value && user) {
      try {
        // Create new user exercise in Dexie
        const newUserExercise: UserExercise = {
          name: option.value,
          user_id: user.id,
          synced: false,
          id: Date.now(), // Dexie will replace this with auto-generated ID
        };

        const exerciseId = await db.userExercises.add(newUserExercise);
        const createdUserExercise = {
          ...newUserExercise,
          id: exerciseId as number,
        };
        setUserExercises((prev) => [...prev, createdUserExercise]);
      } catch (err) {
        console.log(err);
      } finally {
        setExerciseName(option?.value || "");
      }
    } else {
      setExerciseName(option?.value || "");
    }
  };

  const addSet = async () => {
    if (!id || !user) return;

    const workoutId = parseInt(id);
    let targetExercise = exercises.find((ex) => ex.name === exerciseName);

    // If exercise doesn't exist, create it first
    if (!targetExercise) {
      const newExercise: Exercise = {
        name: exerciseName,
        workout_id: workoutId,
        synced: false,
        id: Date.now(), // Dexie will replace this with auto-generated ID
        sets: [],
      };

      const exerciseId = await db.exercises.add(newExercise);
      targetExercise = { ...newExercise, id: exerciseId as number, sets: [] };
      setExercises((prev) => [...prev, targetExercise!]);
    }

    // Create the new set
    const newSet: ExerciseSet = {
      weight,
      reps,
      synced: false,
      exercise_id: targetExercise.id!,
      id: Date.now(), // Dexie will replace this with auto-generated ID
    };

    const setId = await db.sets.add(newSet);
    const createdSet: ExerciseSet = { ...newSet, id: setId as number };

    // Update local state
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === targetExercise!.id
          ? { ...ex, sets: [...ex.sets, createdSet] }
          : ex
      )
    );

    setWeight(defaultWeight);
    setReps(defaultReps);
    setIsSaved(false);
  };

  const addExercise = async () => {
    if (!id || !user) return;

    const newExercise: Exercise = {
      name: exerciseName,
      workout_id: parseInt(id),
      synced: false,
      id: Date.now(), // Dexie will replace this with auto-generated ID
      sets: [],
    };

    const exerciseId = await db.exercises.add(newExercise);
    const createdExercise = {
      ...newExercise,
      id: exerciseId as number,
      sets: [],
    };

    setExercises((prev) => [...prev, createdExercise]);
    setIsSaved(false);
  };

  const handleAddClick = async () => {
    setIsSaved(false);
    if (addSetMode) return addSet();
    if (addExerciseMode) return addExercise();
  };

  const handleSaveWorkout = async () => {
    setIsSaving(true);
    if (!workout) return;

    // For now, just mark as saved since we're only using IndexedDB
    // In the future, this would sync to Supabase

    setIsSaving(false);
    setIsSaved(true);
  };

  const handleNotesInput = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newNotes = e.currentTarget.value;
    setNotes(newNotes);

    if (workout && id) {
      // Update notes in Dexie
      await db.workouts.update(parseInt(id), { notes: newNotes });
      setWorkout((prev) => (prev ? { ...prev, notes: newNotes } : null));
      setIsSaved(false);
    }
  };

  const handleSetDelete = async (setId: number) => {
    try {
      const set = await db.sets.get(setId);
      if (set?.synced === true) {
        // Soft delete from Dexie if synced
        await db.sets.update(setId, { deleted: true });
      } else {
        await db.sets.delete(setId);
      }

      setExercises((prev) => {
        return prev
          .map((exercise) => ({
            ...exercise,
            sets: exercise.sets?.filter((set) => set.id !== setId),
          }))
          .filter((exercise) => exercise.sets?.length > 0);
      });
      setIsSaved(false);
    } catch (error) {
      console.error("Failed to delete set:", error);
    }
  };

  const handleExerciseDelete = async (exerciseId: number) => {
    try {
      // Delete all sets for this exercise first
      const sets = await db.sets
        .where("exercise_id")
        .equals(exerciseId)
        .toArray();
      for (const set of sets) {
        handleSetDelete(set.id!);
      }
      const exercise = await db.exercises.get(exerciseId);
      if (exercise?.synced === true) {
        // Soft delete from Dexie if synced
        await db.exercises.update(exerciseId, { deleted: true });
      } else {
        await db.exercises.delete(exerciseId);
      }
      // Delete the exercise
      await db.exercises.delete(exerciseId);

      // Update local state
      setExercises((prev) => {
        return prev.filter((exercise) => exercise.id !== exerciseId);
      });
      setIsSaved(false);
    } catch (error) {
      console.error("Failed to delete exercise:", error);
    }
  };

  const handleSaveWorkoutAndRedirect = async () => {
    if (!isOnline) return alert("You're offline.");
    if (!isSaved) {
      setIsSaving(true);
      await handleSaveWorkout();
      setIsSaving(false);
    }
    router.push("/");
  };

  const addLabel = addSetMode ? "Add Set" : "Add Exercise";

  useEffect(() => {
    if (!id) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      // Auto-save is now handled directly in the input handlers
      // Notes are saved immediately in handleNotesInput
      // Sets and exercises are saved immediately when created/modified
      if (!isSaved) {
        setIsSaved(true);
      }
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, id, workout, exercises, isSaved]);

  useEffect(() => {
    if (workout?.notes !== undefined) {
      setNotes(workout.notes);
    }
  }, [workout?.notes]);

  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (isSaved) return;
      e.preventDefault();
    }

    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [isSaved]);

  return (
    <main className="p-6">
      {loading || !workout ? (
        <div className="flex items-center justify-center text-4xl">
          <Spinner />
        </div>
      ) : (
        <>
          {!isOnline && (
            <p className="bg-red-500 text-center w-full mb-5">
              You are currently offline
            </p>
          )}
          <div className="flex items-start mb-5 sm:items-center">
            <Header title={workout.title} subtitle={workout.date} />
            <div className="flex flex-col-reverse sm:flex-row gap-4 items-center">
              <div className="flex justify-between gap-4">
                {/* {workout.lastWorkoutId && (
                  <Link href={`/workout/${workout.lastWorkoutId}`}>Prev</Link>
                )}
                {workout.nextWorkoutId && (
                  <Link href={`/workout/${workout.nextWorkoutId}`}>Next</Link>
                )} */}
              </div>
              <Button
                onClick={handleSaveWorkoutAndRedirect}
                className=""
                variant={"secondary"}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Back to workouts"}
              </Button>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            <label>Exercise</label>
            <CreatableSelect
              isClearable
              options={userExercises.map((exercise) => ({
                value: exercise.name,
                label: exercise.name,
              }))}
              onChange={handleSetExerciseName}
              classNames={selectStyles}
            />
            <AddWeightReps
              weight={weight}
              reps={reps}
              setReps={setReps}
              setWeight={setWeight}
            />
            <Button
              disabled={addButtonDisabled}
              onClick={handleAddClick}
              className="w-full"
            >
              <span>{addLabel}</span>
            </Button>
          </div>

          <h3 className="font-bold mb-2 text-xl">Exercises</h3>
          <ul className="space-y-2">
            {exercises.length
              ? exercises.map((ex) => (
                  <ExerciseRow
                    deleteSet={handleSetDelete}
                    deleteExercise={handleExerciseDelete}
                    key={ex.id}
                    exercise={ex}
                    workoutDate={workout.date}
                  />
                ))
              : ""}
          </ul>
          <p className="mt-4 mb-2 text-xl">Notes</p>
          <Textarea
            className="w-full p-2"
            rows={3}
            value={notes}
            onChange={(e) => handleNotesInput(e)}
          />
        </>
      )}
    </main>
  );
}
