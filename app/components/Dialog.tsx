import {
  Dialog as UIDialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";

interface DialogInterface {
  children?: React.ReactNode;
  triggerButtonVariant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  buttonText: string;
  titleText: string;
  triggerClasses?: string;
}

const Dialog = ({
  children,
  triggerButtonVariant,
  buttonText,
  titleText,
  triggerClasses,
}: DialogInterface) => {
  return (
    <UIDialog>
      <DialogTrigger className={triggerClasses} asChild>
        <Button
          className="flex-1"
          variant={
            triggerButtonVariant ? `${triggerButtonVariant}` : "secondary"
          }
          onClick={(e) => e.stopPropagation()}
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="text-center w-80">
        <DialogHeader>
          <DialogTitle className="text-center">{titleText}</DialogTitle>
          <DialogDescription className="flex gap-2 justify-center">
            {children}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </UIDialog>
  );
};
export default Dialog;
