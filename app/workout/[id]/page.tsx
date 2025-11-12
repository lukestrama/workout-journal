"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useWorkout } from "@/lib/hooks/useWorkouts";
import CreatableSelect from "react-select/creatable";
import { SingleValue, ActionMeta } from "react-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BackButton from "@/app/components/BackButton";
import ExerciseRow from "@/app/components/exercises/ExerciseRow";

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
    return "!bg-[#1A191A] hover:!border-white";
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
    createSet,
    createUserExercise,
    createOrGetExercise,
    deleteSet,
    deleteExercise,
  } = useWorkout(id);

  const [exerciseName, setExerciseName] = useState("");
  const [reps, setReps] = useState<number>(defaultWeight);
  const [weight, setWeight] = useState<number>(defaultReps);
  const [setAdditionLoading, setSetAdditionLoading] = useState(false);

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
    if (!workout) return;
    setSetAdditionLoading(true);

    const exercise = await createOrGetExercise(exerciseName);

    if (exercise) {
      await createSet(exercise, { reps, weight });
      setSetAdditionLoading(false);
    }

    setWeight(defaultWeight);
    setReps(defaultReps);
  };

  return (
    <main className="p-6">
      {!workout ? (
        <div className="flex items-center justify-center text-4xl">
          <i className="fa-solid fa-spinner fa-spin"></i>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[40px_1fr] mb-4">
            <BackButton classNames="col-auto" />
            <h1 className="text-2xl font-bold">{workout.title}</h1>
            <h2 className="col-start-2 mb-4 text-lime-600">{workout.date}</h2>
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
            <div className="flex items-end gap-4 mb-5">
              <div>
                <label>Weight</label>
                <Input
                  className="border p-2 w-full"
                  type="number"
                  placeholder="Weight (kg)"
                  value={weight || ""}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />{" "}
              </div>
              <div className="pb-2.5">
                <i className="fa-solid fa-xmark"></i>
              </div>
              <div>
                <label>Reps</label>
                <input
                  className="border p-2 w-full"
                  type="number"
                  placeholder="Reps"
                  value={reps || ""}
                  onChange={(e) => setReps(Number(e.target.value))}
                />
              </div>
            </div>
            <Button
              disabled={setAdditionLoading}
              onClick={addSet}
              className="w-full"
            >
              {setAdditionLoading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                "Add Set"
              )}
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
        </>
      )}
    </main>
  );
}
