import { createFileRoute } from "@tanstack/react-router";
import { PatientHomeContent } from "@/components/patient/PatientHomeContent";

export const Route = createFileRoute("/patient/")({
  component: PatientHomeContent,
});
