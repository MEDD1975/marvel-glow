import type { ReactNode } from "react";
import { PatientProvider, usePatient } from "@/components/patient/PatientProvider";
import { BottomNavigation, KivoirHeader } from "@/components/patient/PatientChrome";

function PrivateAccessNotice() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7FAFE] px-6 py-12 text-center">
      <section className="w-full max-w-md rounded-[28px] border border-[#D8E5F3] bg-white px-7 py-10 shadow-[0_16px_40px_rgba(16,28,51,0.08)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3FF] p-2">
          <img src="/favicon.svg" alt="Logo Kivoir" className="h-full w-full" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#0B63CE]">Espace patient privé</p>
        <h1 className="mt-3 text-balance text-2xl font-bold tracking-tight text-[#101C33]">Accédez à votre parcours via le QR code</h1>
        <p className="mt-4 text-base leading-relaxed text-[#526176]">Cet espace contient des informations transmises par votre professionnel de santé. Scannez le QR code transmis par votre professionnel de santé pour y accéder.</p>
      </section>
    </main>
  );
}

function PatientShellContent({ children }: { children: ReactNode }) {
  const { hasContext } = usePatient();
  if (!hasContext) return <PrivateAccessNotice />;
  return (
    <div className="min-h-dvh bg-background">
      <KivoirHeader />
      <main className="mx-auto max-w-2xl pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-6 md:pb-16 md:pt-10">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}

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
      <PatientShellContent>{children}</PatientShellContent>
    </PatientProvider>
  );
}
