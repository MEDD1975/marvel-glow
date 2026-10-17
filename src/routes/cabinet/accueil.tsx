import { createFileRoute } from "@tanstack/react-router";
import { DoctorHome } from "@/components/DoctorHome";

export const Route = createFileRoute("/cabinet/accueil")({
  head: () => ({
    meta: [{ title: "Accueil professionnel de santé — Kivoir" }],
  }),
  component: DoctorHome,
});
