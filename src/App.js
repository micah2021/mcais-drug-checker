import { useState } from "react";
import LandingPage from "./LandingPage";
import DrugChecker from "./DrugChecker";

export default function App() {
  const [page, setPage] = useState("landing"); // "landing" or "app"

  if (page === "app") return <DrugChecker />;
  return <LandingPage onGetStarted={() => setPage("app")} />;
}
