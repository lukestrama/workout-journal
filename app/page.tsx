"use client";

import LandingPage from "./components/LandingPage";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Spinner from "./components/Spinner";

export default function HomePage() {
  const { user, isLoaded } = useUser();
  if (user) redirect("/workouts");

  return isLoaded ? (
    <LandingPage />
  ) : (
    <div className="h-screen flex justify-center items-center text-8xl">
      <Spinner />
    </div>
  );
}
