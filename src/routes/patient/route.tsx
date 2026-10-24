import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PatientShell } from "@/components/patient/PatientShell";
import { ExpiredQrNotice } from "@/components/patient/ExpiredQrNotice";
import { isExpiredLegacyQr, isExpiredSignedCabinetRef } from "@/lib/legacy-qr";

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
  const ref = typeof search["ref"] === "string" ? search["ref"] : undefined;
  if (isExpiredLegacyQr(ref) || isExpiredSignedCabinetRef(ref)) return <ExpiredQrNotice />;
  return (
    <PatientShell search={search}>
      <Outlet />
    </PatientShell>
  );
}
