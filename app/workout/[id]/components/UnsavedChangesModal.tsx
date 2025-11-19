import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UnsavedChangesModalInterface {
  handleBackToWorkouts: () => void;
  handleSaveWorkoutAndRedirect: () => void;
}

const UnsavedChangesModal = ({
  handleBackToWorkouts,
  handleSaveWorkoutAndRedirect,
}: UnsavedChangesModalInterface) => {
  return (
    <Dialog>
      <Button className="flex-1" variant={"secondary"} asChild>
        <DialogTrigger>Back to workouts</DialogTrigger>
      </Button>
      <DialogContent className="text-center w-80">
        <DialogHeader>
          <DialogTitle className="text-center">
            You have unsaved changes
          </DialogTitle>
          <DialogDescription className="flex gap-2 justify-center">
            <Button variant={"destructive"} onClick={handleBackToWorkouts}>
              Discard changes
            </Button>
            <Button onClick={handleSaveWorkoutAndRedirect}>Save changes</Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
export default UnsavedChangesModal;
