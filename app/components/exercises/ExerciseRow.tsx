import { Exercise, ExerciseSet } from "@/lib/supabase/models";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useExercise } from "@/lib/hooks/useExercise";

interface ExerciseRowProps {
  exercise: Exercise;
  deleteSet: (setId: number) => void;
  deleteExercise: (exerciseId: number) => void;
  workoutDate: string;
}
const ExerciseRow = ({
  exercise,
  workoutDate,
  deleteExercise,
  deleteSet,
}: ExerciseRowProps) => {
  const { lastExercises } = useExercise(exercise);

  const handleSetDelete = async (set: ExerciseSet) => {
    if (set.id) {
      deleteSet(set.id);
    }
  };

  const handleExerciseDelete = async (exercise: Exercise) => {
    if (exercise.id) {
      deleteExercise(exercise.id);
    }
  };

  return (
    <li className="text-lg">
      <Popover>
        <PopoverTrigger asChild>
          <Button className="px-2" variant={"ghost"}>
            {exercise.name}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          alignOffset={50}
          side="top"
          className="w-80"
        >
          {lastExercises.length > 1 ? ( // one will mean its the current exercise (I think)
            <p className="text-lg">Previous workouts</p>
          ) : (
            ""
          )}
          {lastExercises.map((ex: Exercise) => {
            // filter out current workout, we don't need to see that
            if (ex.workout_date !== workoutDate) {
              return (
                <p key={ex.id}>
                  {ex.workout_date} -
                  {ex.sets?.map((set, idx) => (
                    <span key={set.id}>
                      {idx > 0 ? ", " : " "}
                      {set.weight ? set.weight : ""}x{set.reps}
                    </span>
                  ))}
                </p>
              );
            }
            return null;
          })}
          <div className="w-full flex">
            <Button
              variant={"destructive"}
              className="mt-2 w-full"
              onClick={() => handleExerciseDelete(exercise)}
            >
              Delete
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <span>-</span>
      {exercise.sets?.map((set, idx) => (
        <span key={set.id || set.temporaryId}>
          {idx > 0 ? ", " : " "}
          <Popover key={set.id}>
            <PopoverTrigger asChild>
              <Button className="px-0.5 py-0 h-6 items-end" variant={"ghost"}>
                {set.weight ? set.weight : ""}x{set.reps}
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-auto">
              <Button
                onClick={() => handleSetDelete(set)}
                variant={"destructive"}
              >
                Delete
              </Button>
            </PopoverContent>
          </Popover>
        </span>
      ))}
    </li>
  );
};

export default ExerciseRow;
