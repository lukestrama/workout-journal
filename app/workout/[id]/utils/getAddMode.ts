import { ADD_MODES } from "@/lib/constants";
import { Exercise } from "@/lib/supabase/models";

const getAddMode = (
  exercises: Exercise[],
  exerciseName: string,
  reps?: number
): ADD_MODES.exercise | ADD_MODES.set => {
  if (
    !!exerciseName &&
    (exercises.find((ex) => ex.name == exerciseName) || reps)
  ) {
    return ADD_MODES.set;
  }

  return ADD_MODES.exercise;
};

export default getAddMode;
