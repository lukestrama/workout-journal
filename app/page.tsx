"use client";

import LandingPage from "./components/LandingPage";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function HomePage() {
  const { user } = useUser();
  if (user) redirect("/workouts");

  return <LandingPage />;
}
