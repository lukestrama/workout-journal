"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useWorkout } from "@/lib/hooks/useWorkout";
import CreatableSelect from "react-select/creatable";
import { SingleValue, ActionMeta } from "react-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ExerciseRow from "@/app/components/exercises/ExerciseRow";
import { Header } from "@/app/components/Header";
import Spinner from "@/app/components/Spinner";
import getAddMode from "./utils/getAddMode";
import { ADD_MODES } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";

const defaultWeight = 0;
const defaultReps = 0;

interface StateProperties {
  isSelected: boolean;
}

const selectStyles = {
  menu: () => {
    return "!bg-[#1A191A]";
  },
  option: (state: StateProperties) => {
    return `!bg-[#1A191A] hover:!bg-lime-950 active:!bg-lime-950 active:!border-lime-800 active:!border-solid active:!border-1 ${
      state.isSelected ? "!bg-lime-950" : ""
    }`;
  },
  control: () => {
    return "!bg-[#1A191A] hover:!border-white !rounded-md";
  },
  singleValue: () => {
    return "!text-white";
  },
};

export default function WorkoutPage() {
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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    const newSet = { weight, reps, id: null, exercise_id: "" };
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
          temporaryId: Math.random().toString(10).substring(2, 8),
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
          temporaryId: Math.random().toString(10).substring(2, 8),
        },
      ];
    });
  };

  const handleAddClick = async () => {
    if (addSetMode) return addSet();
    if (addExerciseMode) return addExercise();
  };
  const handleSaveWorkout = async () => {
    setIsSaving(true);
    if (!workout) return;

    await saveWorkout(workout?.id, exercises);

    setIsSaving(false);
  };

  const handleNotesInput = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNotes(e.currentTarget.value);
  };

  const addLabel = addSetMode ? "Add Set" : "Add Exercise";

  useEffect(() => {
    if (!id) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (notes) {
        updateNotes(id, notes);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, updateNotes, id]);

  useEffect(() => {
    if (workout?.notes !== undefined) {
      setNotes(workout.notes);
    }
  }, [workout?.notes]);

  return (
    <main className="p-6">
      {!workout ? (
        <div className="flex items-center justify-center text-4xl">
          <Spinner />
        </div>
      ) : (
        <>
          <Header title={workout.title} subtitle={workout.date} />
          <div className="flex justify-end">
            <Button
              className="w-40"
              disabled={isSaving}
              onClick={handleSaveWorkout}
            >
              {isSaving ? <Spinner /> : "Save Workout"}
            </Button>
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
            <div className="flex items-end gap-4 mb-5 w-full">
              <div className="flex-1">
                <label>Weight</label>
                <Input
                  className="border p-2 w-full"
                  type="number"
                  placeholder="Weight (kg)"
                  value={weight || ""}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />{" "}
              </div>
              <div className="pb-1">
                <i className="fa-solid fa-xmark"></i>
              </div>
              <div className="flex-1">
                <label>Reps</label>
                <Input
                  className="border p-2 w-full"
                  type="number"
                  placeholder="Reps"
                  value={reps || ""}
                  onChange={(e) => setReps(Number(e.target.value))}
                />
              </div>
            </div>
            <Button
              disabled={addButtonDisabled}
              onClick={handleAddClick}
              className="w-full"
            >
              <span>{addLabel}</span>
            </Button>
          </div>

          <h3 className="font-bold mb-2">Exercises</h3>
          <ul className="space-y-2">
            {exercises.length
              ? exercises.map((ex) => (
                  <ExerciseRow
                    deleteExercise={deleteExercise}
                    deleteSet={deleteSet}
                    key={ex.id}
                    exercise={ex}
                  />
                ))
              : ""}
          </ul>
          <p className="mt-4 mb-2">Notes</p>
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
