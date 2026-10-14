import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PatientProvider } from "@/components/patient/PatientProvider";
import { BottomNavigation, KivoirHeader } from "@/components/patient/PatientChrome";

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
    <PatientProvider search={search}>
      <div className="min-h-dvh bg-background">
        <KivoirHeader />
        <main className="mx-auto max-w-2xl px-4 pb-[calc(env(safe-area-inset-bottom)+6rem)] pt-5">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </PatientProvider>
  );
}
