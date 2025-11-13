import { Exercise } from "@/lib/supabase/models";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useExercise } from "@/lib/hooks/useExercise";

interface ExerciseRowProps {
  exercise: Exercise;
  deleteSet: (setId: string) => void;
  deleteExercise: (exerciseId: string) => void;
}
const ExerciseRow = ({
  exercise,
  deleteSet,
  deleteExercise,
}: ExerciseRowProps) => {
  const { exercises } = useExercise(exercise);

  const handleSetDelete = async (setId: string) => {
    await deleteSet(setId);
  };

  const handleExerciseDelete = async (exerciseId: string) => {
    await deleteExercise(exerciseId);
  };

  return (
    <li>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="px-2" variant={"ghost"}>
            {exercise.name}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          {exercises.map((ex: Exercise) => (
            <p key={ex.id}>
              {ex.workout_date} -
              {ex.sets?.map((set, idx) => (
                <span key={set.id}>
                  {idx > 0 ? ", " : " "}
                  {set.weight}x{set.reps}
                </span>
              ))}
            </p>
          ))}
          <Button onClick={() => handleExerciseDelete(exercise.id)}>
            Delete
          </Button>
        </PopoverContent>
      </Popover>
      <span>-</span>
      {exercise.sets?.map((set, idx) => (
        <span key={set.id}>
          {idx > 0 ? ", " : " "}
          <Popover key={set.id}>
            <PopoverTrigger asChild>
              <Button className="px-2" variant={"ghost"}>
                {set.weight ? set.weight : ""}x{set.reps}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <Button onClick={() => handleSetDelete(set.id)}>Delete</Button>
            </PopoverContent>
          </Popover>
        </span>
      ))}
    </li>
  );
};

export default ExerciseRow;
