"use client";

import { useState } from "react";
import HomeView from "@/components/HomeView";
import DemoView from "@/components/DemoView";

type Screen = "home" | "demo";

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>("home");

  if (screen === "demo") {
    return <DemoView onExit={() => setScreen("home")} />;
  }

  return <HomeView onStartDemo={() => setScreen("demo")} />;
}
