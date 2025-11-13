// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
// import { useParams } from "next/navigation";
// import WorkoutPage from "@/app/workout/[id]/page";
// import { useWorkout } from "@/lib/hooks/useWorkouts";
// import { Exercise, UserExercise, Workout } from "@/lib/supabase/models";

// // Mock next/navigation
// vi.mock("next/navigation", () => ({
//   useParams: vi.fn(),
// }));

// // Mock the useWorkout hook
// vi.mock("@/lib/hooks/useWorkouts", () => ({
//   useWorkout: vi.fn(),
// }));

// // Mock components that are not relevant to the logic we're testing
// vi.mock("@/app/components/exercises/ExerciseRow", () => ({
//   default: ({ exercise }: { exercise: Exercise }) => (
//     <div data-testid="exercise-row">{exercise.name}</div>
//   ),
// }));

// vi.mock("@/app/components/Header", () => ({
//   Header: ({ title, subtitle }: { title: string; subtitle: string }) => (
//     <div data-testid="header">
//       {title} - {subtitle}
//     </div>
//   ),
// }));

// vi.mock("@/components/ui/button", () => ({
//   Button: ({ children, onClick, disabled }: any) => (
//     <button onClick={onClick} disabled={disabled} data-testid="add-button">
//       {children}
//     </button>
//   ),
// }));

// vi.mock("@/components/ui/input", () => ({
//   Input: ({ value, onChange, placeholder, type }: any) => (
//     <input
//       type={type}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       data-testid={
//         placeholder.toLowerCase().includes("weight")
//           ? "weight-input"
//           : "reps-input"
//       }
//     />
//   ),
// }));

// vi.mock("react-select/creatable", () => ({
//   default: ({ onChange, options, isClearable }: any) => (
//     <select
//       data-testid="exercise-select"
//       onChange={(e) => {
//         const value = e.target.value;
//         const option = options.find((opt: any) => opt.value === value);
//         onChange(option, { action: "select-option" });
//       }}
//     >
//       <option value="">Select exercise...</option>
//       {options.map((option: any) => (
//         <option key={option.value} value={option.value}>
//           {option.label}
//         </option>
//       ))}
//     </select>
//   ),
// }));

// describe("WorkoutPage - Add Set Mode and Add Exercise Mode Logic", () => {
//   const mockUseParams = useParams as Mock;
//   const mockUseWorkout = useWorkout as Mock;

//   const mockWorkout: Workout = {
//     id: "workout-1",
//     title: "Push Day",
//     date: "2024-01-01",
//     exercises: [],
//     user_id: "user-1",
//   };

//   const mockUserExercises: UserExercise[] = [
//     { id: "user-ex-1", name: "Bench Press", user_id: "user-1" },
//     { id: "user-ex-2", name: "Overhead Press", user_id: "user-1" },
//   ];

//   const mockExerciseWithSets: Exercise = {
//     id: "ex-1",
//     name: "Bench Press",
//     workout_id: "workout-1",
//     sets: [{ id: "set-1", weight: 100, reps: 10, exercise_id: "ex-1" }],
//   };

//   const mockExerciseWithoutSets: Exercise = {
//     id: "ex-2",
//     name: "Overhead Press",
//     workout_id: "workout-1",
//     sets: [],
//   };

//   const defaultMockHookReturn = {
//     workout: mockWorkout,
//     exercises: [],
//     userExercises: mockUserExercises,
//     createSet: vi.fn(),
//     createUserExercise: vi.fn(),
//     createOrGetExercise: vi.fn(),
//     deleteSet: vi.fn(),
//     deleteExercise: vi.fn(),
//   };

//   beforeEach(() => {
//     vi.clearAllMocks();
//     mockUseParams.mockReturnValue({ id: "workout-1" });
//     mockUseWorkout.mockReturnValue(defaultMockHookReturn);
//   });

//   describe("Add Exercise Mode Logic", () => {
//     it("should be in add exercise mode when no exercise is selected", async () => {
//       render(<WorkoutPage />);

//       const addButton = screen.getByTestId("add-button");
//       expect(addButton).contains("Add Exercise");
//       await expect.element(addButton).toBeDisabled(); // No exercise selected
//     });

//     it("should be in add exercise mode when exercise is selected but no weight or reps", () => {
//       render(<WorkoutPage />);

//       const exerciseSelect = screen.getByTestId("exercise-select");
//       fireEvent.change(exerciseSelect, { target: { value: "Bench Press" } });

//       const addButton = screen.getByTestId("add-button");
//       expect(addButton).toHaveTextContent("Add Exercise");
//       expect(addButton).not.toBeDisabled(); // Exercise is selected
//     });

//     it("should enable add exercise button when only exercise name is provided", () => {
//       render(<WorkoutPage />);

//       const exerciseSelect = screen.getByTestId("exercise-select");
//       fireEvent.change(exerciseSelect, { target: { value: "Bench Press" } });

//       const addButton = screen.getByTestId("add-button");
//       expect(addButton).not.toBeDisabled();
//       expect(addButton).toHaveTextContent("Add Exercise");
//     });

//     it("should call createOrGetExercise when clicking add exercise button", async () => {
//       const mockCreateOrGetExercise = vi
//         .fn()
//         .mockResolvedValue(mockExerciseWithoutSets);
//       mockUseWorkout.mockReturnValue({
//         ...defaultMockHookReturn,
//         createOrGetExercise: mockCreateOrGetExercise,
//       });

//       render(<WorkoutPage />);

//       const exerciseSelect = screen.getByTestId("exercise-select");
//       fireEvent.change(exerciseSelect, { target: { value: "Bench Press" } });

//       const addButton = screen.getByTestId("add-button");
//       fireEvent.click(addButton);

//       await waitFor(() => {
//         expect(mockCreateOrGetExercise).toHaveBeenCalledWith("Bench Press");
//       });
//     });
//   });

//   describe("Add Set Mode Logic", () => {
//     it("should be in add set mode when exercise exists in workout exercises", () => {
//       mockUseWorkout.mockReturnValue({
//         ...defaultMockHookReturn,
//         exercises: [mockExerciseWithSets],
//       });

//       render(<WorkoutPage />);

//       const exerciseSelect = screen.getByTestId("exercise-select");
//       fireEvent.change(exerciseSelect, { target: { value: "Bench Press" } });

//       const weightInput = screen.getByTestId("weight-input");
//       const repsInput = screen.getByTestId("reps-input");

//       fireEvent.change(weightInput, { target: { value: "120" } });
//       fireEvent.change(repsInput, { target: { value: "8" } });

//       const addButton = screen.getByTestId("add-button");
//       expect(addButton).toHaveTextContent("Add Set");
//       expect(addButton).not.toBeDisabled();
//     });

//     it("should disable add set button when weight or reps are missing", () => {
//       mockUseWorkout.mockReturnValue({
//         ...defaultMockHookReturn,
//         exercises: [mockExerciseWithSets],
//       });

//       render(<WorkoutPage />);

//       const exerciseSelect = screen.getByTestId("exercise-select");
//       fireEvent.change(exerciseSelect, { target: { value: "Bench Press" } });

//       // Only weight, no reps
//       const weightInput = screen.getByTestId("weight-input");
//       fireEvent.change(weightInput, { target: { value: "120" } });

//       const addButton = screen.getByTestId("add-button");
//       expect(addButton).toHaveTextContent("Add Set");
//       expect(addButton).toBeDisabled();
//     });

//     it("should disable add set button when reps are provided but weight is 0", () => {
//       mockUseWorkout.mockReturnValue({
//         ...defaultMockHookReturn,
//         exercises: [mockExerciseWithSets],
//       });

//       render(<WorkoutPage />);

//       const exerciseSelect = screen.getByTestId("exercise-select");
//       fireEvent.change(exerciseSelect, { target: { value: "Bench Press" } });

//       // Only reps, no weight
//       const repsInput = screen.getByTestId("reps-input");
//       fireEvent.change(repsInput, { target: { value: "8" } });

//       const addButton = screen.getByTestId("add-button");
//       expect(addButton).toHaveTextContent("Add Set");
//       expect(addButton).toBeDisabled();
//     });

//     it("should call createSet when clicking add set button with valid data", async () => {
//       const mockCreateSet = vi.fn().mockResolvedValue({});
//       const mockCreateOrGetExercise = vi
//         .fn()
//         .mockResolvedValue(mockExerciseWithSets);

//       mockUseWorkout.mockReturnValue({
//         ...defaultMockHookReturn,
//         exercises: [mockExerciseWithSets],
//         createSet: mockCreateSet,
//         createOrGetExercise: mockCreateOrGetExercise,
//       });

//       render(<WorkoutPage />);

//       const exerciseSelect = screen.getByTestId("exercise-select");
//       fireEvent.change(exerciseSelect, { target: { value: "Bench Press" } });

//       const weightInput = screen.getByTestId("weight-input");
//       const repsInput = screen.getByTestId("reps-input");

//       fireEvent.change(weightInput, { target: { value: "120" } });
//       fireEvent.change(repsInput, { target: { value: "8" } });

//       const addButton = screen.getByTestId("add-button");
//       fireEvent.click(addButton);

//       await waitFor(() => {
//         expect(mockCreateOrGetExercise).toHaveBeenCalledWith("Bench Press");
//         expect(mockCreateSet).toHaveBeenCalledWith(mockExerciseWithSets, {
//           reps: 8,
//           weight: 120,
//         });
//       });
//     });

//     it("should reset weight and reps after adding a set", async () => {
//       const mockCreateSet = vi.fn().mockResolvedValue({});
//       const mockCreateOrGetExercise = vi
//         .fn()
//         .mockResolvedValue(mockExerciseWithSets);

//       mockUseWorkout.mockReturnValue({
//         ...defaultMockHookReturn,
//         exercises: [mockExerciseWithSets],
//         createSet: mockCreateSet,
//         createOrGetExercise: mockCreateOrGetExercise,
//       });

//       render(<WorkoutPage />);

//       const exerciseSelect = screen.getByTestId("exercise-select");
//       fireEvent.change(exerciseSelect, { target: { value: "Bench Press" } });

//       const weightInput = screen.getByTestId("weight-input");
//       const repsInput = screen.getByTestId("reps-input");

//       fireEvent.change(weightInput, { target: { value: "120" } });
//       fireEvent.change(repsInput, { target: { value: "8" } });

//       const addButton = screen.getByTestId("add-button");
//       fireEvent.click(addButton);

//       await waitFor(() => {
//         expect(weightInput).toHaveValue("");
//         expect(repsInput).toHaveValue("");
//       });
//     });
//   });

//   describe("Mode Transition Logic", () => {
//     it("should transition from add exercise mode to add set mode when exercise is added", () => {
//       mockUseWorkout.mockReturnValue({
//         ...defaultMockHookReturn,
//         exercises: [], // Initially no exercises
//       });

//       const { rerender } = render(<WorkoutPage />);

//       const exerciseSelect = screen.getByTestId("exercise-select");
//       fireEvent.change(exerciseSelect, { target: { value: "Bench Press" } });

//       let addButton = screen.getByTestId("add-button");
//       expect(addButton).toHaveTextContent("Add Exercise");

//       // Simulate exercise being added to workout
//       mockUseWorkout.mockReturnValue({
//         ...defaultMockHookReturn,
//         exercises: [mockExerciseWithoutSets],
//       });

//       rerender(<WorkoutPage />);

//       // Select the exercise again
//       fireEvent.change(exerciseSelect, { target: { value: "Bench Press" } });

//       addButton = screen.getByTestId("add-button");
//       expect(addButton).toHaveTextContent("Add Set");
//     });

//     it("should be in add exercise mode for new exercise not in workout", () => {
//       mockUseWorkout.mockReturnValue({
//         ...defaultMockHookReturn,
//         exercises: [mockExerciseWithSets], // Only Bench Press exists
//       });

//       render(<WorkoutPage />);

//       const exerciseSelect = screen.getByTestId("exercise-select");
//       fireEvent.change(exerciseSelect, { target: { value: "Overhead Press" } }); // Different exercise

//       const addButton = screen.getByTestId("add-button");
//       expect(addButton).toHaveTextContent("Add Exercise");
//     });
//   });

//   describe("Button State Logic", () => {
//     it("should disable button during loading state", async () => {
//       const mockCreateSet = vi
//         .fn()
//         .mockImplementation(
//           () => new Promise((resolve) => setTimeout(resolve, 100))
//         );
//       const mockCreateOrGetExercise = vi
//         .fn()
//         .mockResolvedValue(mockExerciseWithSets);

//       mockUseWorkout.mockReturnValue({
//         ...defaultMockHookReturn,
//         exercises: [mockExerciseWithSets],
//         createSet: mockCreateSet,
//         createOrGetExercise: mockCreateOrGetExercise,
//       });

//       render(<WorkoutPage />);

//       const exerciseSelect = screen.getByTestId("exercise-select");
//       fireEvent.change(exerciseSelect, { target: { value: "Bench Press" } });

//       const weightInput = screen.getByTestId("weight-input");
//       const repsInput = screen.getByTestId("reps-input");

//       fireEvent.change(weightInput, { target: { value: "120" } });
//       fireEvent.change(repsInput, { target: { value: "8" } });

//       const addButton = screen.getByTestId("add-button");
//       fireEvent.click(addButton);

//       // Button should be disabled during loading
//       expect(addButton).toBeDisabled();

//       await waitFor(
//         () => {
//           expect(addButton).not.toBeDisabled();
//         },
//         { timeout: 200 }
//       );
//     });

//     it("should show loading spinner during addition", async () => {
//       const mockCreateSet = vi
//         .fn()
//         .mockImplementation(
//           () => new Promise((resolve) => setTimeout(resolve, 100))
//         );
//       const mockCreateOrGetExercise = vi
//         .fn()
//         .mockResolvedValue(mockExerciseWithSets);

//       mockUseWorkout.mockReturnValue({
//         ...defaultMockHookReturn,
//         exercises: [mockExerciseWithSets],
//         createSet: mockCreateSet,
//         createOrGetExercise: mockCreateOrGetExercise,
//       });

//       render(<WorkoutPage />);

//       const exerciseSelect = screen.getByTestId("exercise-select");
//       fireEvent.change(exerciseSelect, { target: { value: "Bench Press" } });

//       const weightInput = screen.getByTestId("weight-input");
//       const repsInput = screen.getByTestId("reps-input");

//       fireEvent.change(weightInput, { target: { value: "120" } });
//       fireEvent.change(repsInput, { target: { value: "8" } });

//       const addButton = screen.getByTestId("add-button");
//       fireEvent.click(addButton);

//       // Should show loading spinner
//       expect(screen.getByRole("button")).toContainHTML("fa-spinner");

//       await waitFor(
//         () => {
//           expect(screen.queryByText("fa-spinner")).not.toBeInTheDocument();
//         },
//         { timeout: 200 }
//       );
//     });
//   });
// });
