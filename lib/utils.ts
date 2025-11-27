import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function genRandomInt() {
  return parseInt(Math.random().toString(10).substring(2, 8));
}

interface StateProperties {
  isSelected: boolean;
}

export const selectStyles = {
  menu: () => {
    return "!bg-[#1A191A] !text-lg";
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
