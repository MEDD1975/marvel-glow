import { createFileRoute } from "@tanstack/react-router";
import { DoctorHome } from "@/components/DoctorHome";

export const Route = createFileRoute("/cabinet/accueil")({
  head: () => ({
    meta: [{ title: "Accueil médecin — Kivoir" }],
  }),
  component: DoctorHome,
});
