import { Exercise } from "@/lib/supabase/models";

interface ExerciseRowBasicInterface {
  exercise: Exercise;
}
export const ExerciseRowBasic = ({ exercise }: ExerciseRowBasicInterface) => {
  return (
    <p className="flex">
      {exercise.name}
      {" - "}
      {exercise.sets.length
        ? exercise.sets.map((s) => (
            <span key={s.id}>
              {s.weight}x{s.reps}
            </span>
          ))
        : ""}
    </p>
  );
};
