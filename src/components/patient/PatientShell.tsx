import type { ReactNode } from "react";
import { PatientProvider } from "@/components/patient/PatientProvider";
import { BottomNavigation, KivoirHeader } from "@/components/patient/PatientChrome";

/** Mise en page commune de toutes les pages patient (contexte QR, en-tête, navigation). */
export function PatientShell({
  search,
  requireFreshContext,
  children,
}: {
  search: Record<string, unknown>;
  requireFreshContext?: boolean;
  children: ReactNode;
}) {
  return (
    <PatientProvider search={search} requireFreshContext={requireFreshContext}>
      <div className="min-h-dvh bg-background">
        <KivoirHeader />
        <main className="mx-auto max-w-2xl pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-6 md:pb-16 md:pt-10">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </PatientProvider>
  );
}
