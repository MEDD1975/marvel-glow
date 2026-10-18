import { PatientShell } from "@/components/patient/PatientShell";
import { PatientHomeContent } from "@/components/patient/PatientHomeContent";

function hasQrContext(search: Record<string, unknown>) {
  return Boolean(
    (typeof search["pathway"] === "string" && search["pathway"].trim()) ||
      (typeof search["ref"] === "string" && search["ref"].trim()),
  );
}

export function PatientLanding({ search }: { search: Record<string, unknown> }) {
  if (!hasQrContext(search)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7FAFE] px-6 py-12 text-center">
        <section className="w-full max-w-md rounded-[28px] border border-[#D8E5F3] bg-white px-7 py-10 shadow-[0_16px_40px_rgba(16,28,51,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3FF] text-3xl font-bold text-[#0B63CE]">K</div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#0B63CE]">Espace patient privé</p>
          <h1 className="mt-3 text-balance text-2xl font-bold tracking-tight text-[#101C33]">Accédez à votre parcours via le QR code</h1>
          <p className="mt-4 text-base leading-relaxed text-[#526176]">Cet espace contient des informations transmises par votre professionnel de santé. Scannez le QR code remis lors de votre consultation pour y accéder.</p>
        </section>
      </main>
    );
  }

  return (
    <PatientShell search={search}>
      <PatientHomeContent />
    </PatientShell>
  );
}
