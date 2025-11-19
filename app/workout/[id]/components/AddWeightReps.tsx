import { Input } from "@/components/ui/input";
interface AddWeightRepsProps {
  weight: number;
  reps: number;
  setWeight: (weight: number) => void;
  setReps: (reps: number) => void;
}
const AddWeightReps = ({
  weight,
  reps,
  setWeight,
  setReps,
}: AddWeightRepsProps) => {
  return (
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
  );
};

export default AddWeightReps;
