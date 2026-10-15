import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PatientShell } from "@/components/patient/PatientShell";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "Mon espace patient — Kivoir" },
      { name: "description", content: "Retrouvez les conseils, ressources et professionnels recommandés par votre cabinet." },
    ],
  }),
  component: PatientLayout,
});

function PatientLayout() {
  const search = Route.useSearch() as Record<string, unknown>;
  return (
    <PatientShell search={search}>
      <Outlet />
    </PatientShell>
  );
}
