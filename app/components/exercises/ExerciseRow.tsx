import { Exercise } from "@/lib/supabase/models"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ExerciseRowProps {
    exercise: Exercise,
    deleteSet: (setId: string) => void
}
const ExerciseRow = ({exercise, deleteSet}: ExerciseRowProps) => {
    const handleSetDelete = async (setId: string) => {
        await deleteSet(setId);
    };

    return (
        exercise.sets.length ? (
            <li>
                {exercise.name} <span>-</span>
                {exercise.sets?.map((set, idx) => (
                    <>
                    {idx > 0 ? ", " : " "}
                    <Popover key={set.id}>
                        <PopoverTrigger asChild>
                        <Button className="px-2" variant={"ghost"}>
                            {set.weight ? set.weight : ""}x{set.reps}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                        <Button onClick={() => handleSetDelete(set.id)}>
                            Delete
                        </Button>
                        </PopoverContent>
                    </Popover>
                    </>
                ))}
            </li>
        ) : ''
    )
}

export default ExerciseRow