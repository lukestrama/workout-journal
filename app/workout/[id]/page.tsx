"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWorkout } from "@/lib/hooks/useWorkout";
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
import { genRandomInt } from "@/lib/utils";
import AddWeightReps from "./components/AddWeightReps";
import { selectStyles } from "@/lib/utils";
import { useConnectionStatus } from "@/lib/hooks/useConnectionStatus";

const defaultWeight = 0;
const defaultReps = 0;

export default function WorkoutPage() {
  const router = useRouter();
  const { isOnline } = useConnectionStatus();
  const { id } = useParams<{ id: string }>();
  const {
    workout,
    exercises,
    userExercises,
    setExercises,
    createUserExercise,
    deleteSet,
    deleteExercise,
    updateNotes,
    saveWorkout,
  } = useWorkout(id);

  const [exerciseName, setExerciseName] = useState("");
  const [reps, setReps] = useState<number>(defaultReps);
  const [weight, setWeight] = useState<number>(defaultWeight);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveRequestIdRef = useRef<string | null>(null);
  const isPageVisibleRef = useRef(true);
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
    if (action === "create-option" && option?.value) {
      try {
        await createUserExercise(option.value);
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
    const newSet = {
      weight,
      reps,
      id: null,
      exercise_id: "",
      temporaryId: genRandomInt(),
    };

    setExercises((prev) => {
      if (prev.find((ex) => ex.name === exerciseName)) {
        return prev.map((ex) => {
          if (ex.name === exerciseName) {
            return { ...ex, sets: [...ex.sets, newSet] };
          }
          return ex;
        });
      }
      return [
        ...prev,
        {
          id: null,
          name: exerciseName,
          sets: [newSet],
          workout_id: id,
          temporaryId: genRandomInt(),
        },
      ];
    });
    setWeight(defaultWeight);
    setReps(defaultReps);
  };

  const addExercise = async () => {
    setExercises((prev) => {
      return [
        ...prev,
        {
          id: null,
          name: exerciseName,
          sets: [],
          workout_id: id,
          temporaryId: genRandomInt(),
        },
      ];
    });
  };

  const handleAddClick = async () => {
    setIsSaved(false);

    // Clear any pending auto-save to prevent race conditions
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (addSetMode) return addSet();
    if (addExerciseMode) return addExercise();
  };

  const handleSaveWorkout = useCallback(async () => {
    if (isSaving || !workout) return;

    // Generate unique request ID to prevent duplicates
    const requestId = crypto.randomUUID();
    saveRequestIdRef.current = requestId;

    setIsSaving(true);

    try {
      await saveWorkout(workout?.id, exercises);

      // Only update state if this is still the latest request
      if (saveRequestIdRef.current === requestId) {
        setIsSaved(true);
        localStorage.removeItem("exercises");
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      // Only update loading state if this is still the latest request
      if (saveRequestIdRef.current === requestId) {
        setIsSaving(false);
      }
    }
  }, [isSaving, workout, saveWorkout, exercises]);

  const handleNotesInput = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNotes(e.currentTarget.value);
  };

  const handleLocalSetDelete = (setId: string) => {
    setExercises((prev) => {
      return prev
        .map((exercise) => ({
          ...exercise,
          sets: exercise.sets.filter((set) => set.temporaryId !== setId),
        }))
        .filter((exercise) => exercise.sets.length > 0);
    });
    setIsSaved(false);
  };

  const handleLocalExerciseDelete = (exerciseId: string) => {
    setExercises((prev) => {
      return prev.filter((exercise) => exercise.temporaryId !== exerciseId);
    });
    setIsSaved(false);
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

  // Create stable reference for exercises to prevent unnecessary re-renders
  const exercisesRef = useRef(exercises);
  const exercisesSignature = useMemo(() => {
    return JSON.stringify(
      exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        setsCount: ex.sets.length,
      }))
    );
  }, [exercises]);

  useEffect(() => {
    exercisesRef.current = exercises;
  }, [exercises]);

  const addLabel = addSetMode ? "Add Set" : "Add Exercise";

  // Handle page visibility changes (phone lock/unlock)
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisibleRef.current = !document.hidden;

      if (document.hidden) {
        // Page is hidden (phone locked) - save immediately if needed
        if (!isSaved && workout?.id && isOnline && !isSaving) {
          handleSaveWorkout();
        }
        // Clear any pending timeout to prevent duplicate saves
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleSaveWorkout, isSaved, workout?.id, isOnline, isSaving]);

  // Auto-save with improved debouncing and deduplication
  useEffect(() => {
    if (!id || !workout?.id || !isPageVisibleRef.current) return;

    // Don't schedule save if already saving
    if (isSaving) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      // Only save if page is still visible and we're not already saving
      if (!isPageVisibleRef.current || isSaving) return;

      const shouldSaveNotes = notes && notes !== (workout.notes || "");
      const shouldSaveWorkout = !isSaved && isOnline;

      if (shouldSaveNotes) {
        updateNotes(id, notes);
      }

      if (shouldSaveWorkout) {
        // Prevent multiple concurrent saves
        const currentRequestId = crypto.randomUUID();
        saveRequestIdRef.current = currentRequestId;

        saveWorkout(workout?.id, exercisesRef.current)
          .then(() => {
            // Only update state if this is still the latest request
            if (
              saveRequestIdRef.current === currentRequestId &&
              isPageVisibleRef.current
            ) {
              setIsSaved(true);
            }
          })
          .catch((error) => {
            console.error("Auto-save failed:", error);
          });
      }
    }, 2000); // Increased debounce time

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    notes,
    workout?.notes,
    workout?.id,
    isSaved,
    isOnline,
    isSaving,
    id,
    updateNotes,
    saveWorkout,
    exercisesSignature,
  ]); // Use exercises signature for stable dependency

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
      {!workout ? (
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
                {workout.lastWorkoutId && (
                  <Link href={`/workout/${workout.lastWorkoutId}`}>Prev</Link>
                )}
                {workout.nextWorkoutId && (
                  <Link href={`/workout/${workout.nextWorkoutId}`}>Next</Link>
                )}
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
                    removeLocalSet={handleLocalSetDelete}
                    removeLocalExercise={handleLocalExerciseDelete}
                    deleteExercise={deleteExercise}
                    deleteSet={deleteSet}
                    key={ex.id || ex.temporaryId}
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
