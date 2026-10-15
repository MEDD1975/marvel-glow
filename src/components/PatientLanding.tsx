import { PatientShell } from "@/components/patient/PatientShell";
import { PatientHomeContent } from "@/components/patient/PatientHomeContent";

export function PatientLanding({ search }: { search: Record<string, unknown> }) {
  return (
    <PatientShell search={search}>
      <PatientHomeContent />
    </PatientShell>
  );
}
