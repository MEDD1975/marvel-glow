import { createFileRoute, redirect } from "@tanstack/react-router";

// The exercises module was removed: old links fall back to the educational content page.
export const Route = createFileRoute("/patient/ressources/exercices")({
  beforeLoad: () => {
    throw redirect({ to: "/patient/ressources" });
  },
});
