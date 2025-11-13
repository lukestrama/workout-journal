import { describe, it, expect } from "vitest";
import getAddMode from "@/app/workout/[id]/utils/getAddMode";
import { ADD_MODES } from "@/lib/constants";

describe("getAddMode", () => {
  it('should return "exercise" when no parameters are provided', () => {
    const result = getAddMode([], "");
    expect(result).toBe(ADD_MODES.exercise);
  });

  it('should return "exercise" when exercise name does not exist in workout', () => {
    const result = getAddMode(
      [{ id: "1", name: "Bob", sets: [], workout_id: "2" }],
      "John"
    );
    expect(result).toBe(ADD_MODES.exercise);
  });

  it('should return "set" when exercise name is not in workout but we have reps', () => {
    const result = getAddMode(
      [{ id: "1", name: "Bob", sets: [], workout_id: "2" }],
      "John",
      2
    );
    expect(result).toBe(ADD_MODES.set);
  });

  it('should return "set" when exercise name is in workout and we have reps', () => {
    const result = getAddMode(
      [{ id: "1", name: "John", sets: [], workout_id: "2" }],
      "John",
      2
    );
    expect(result).toBe(ADD_MODES.set);
  });
});
