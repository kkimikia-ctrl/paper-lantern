"use client";

import { useState } from "react";
import HomeView from "@/components/HomeView";
import DemoView from "@/components/DemoView";
import UploadView from "@/components/UploadView";

type Screen = "home" | "demo" | "upload";

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>("home");

  if (screen === "demo") {
    return <DemoView onExit={() => setScreen("home")} />;
  }

  if (screen === "upload") return <UploadView onExit={() => setScreen("home")} />;

  return <HomeView onStartDemo={() => setScreen("demo")} onStartUpload={() => setScreen("upload")} />;
}
