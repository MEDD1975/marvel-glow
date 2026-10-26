import { QrCode } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PatientShell } from "@/components/patient/PatientShell";
import { PatientHomeContent } from "@/components/patient/PatientHomeContent";

function hasQrContext(search: Record<string, unknown>) {
  return Boolean(
    (typeof search["pathway"] === "string" && search["pathway"].trim()) ||
      (typeof search["ref"] === "string" && search["ref"].trim()),
  );
}

function PublicHome() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F7FAFE] px-5 py-10">
      <section
        aria-labelledby="public-home-title"
        className="w-full max-w-[720px] rounded-[28px] border border-[#D8E5F3] bg-white px-7 py-12 text-center shadow-[0_18px_45px_rgba(16,28,51,0.07)] sm:px-14 sm:py-16"
      >
        <div className="flex justify-center text-[#327F78]">
          <Logo size="lg" />
        </div>
        <p className="mt-9 text-sm font-bold uppercase tracking-[0.16em] text-[#2F69C8]">
          Espace patient privé
        </p>
        <h1 id="public-home-title" className="mx-auto mt-5 max-w-[18ch] text-balance text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-[#101C33] sm:text-5xl">
          Accédez à votre parcours via le QR code
        </h1>
        <p className="mx-auto mt-8 max-w-[34rem] text-pretty text-lg leading-[1.75] text-[#526176] sm:text-xl">
          Cet espace contient des informations transmises par votre professionnel de santé. Scannez le QR code transmis par votre professionnel de santé pour y accéder.
        </p>
        <div className="mx-auto mt-9 flex w-fit items-center gap-2 rounded-full bg-[#F0F6FF] px-4 py-2 text-sm font-semibold text-[#2F69C8]">
          <QrCode className="h-4 w-4" aria-hidden="true" />
          Accès sécurisé par QR code
        </div>
      </section>
    </main>
  );
}

export function PatientLanding({ search }: { search: Record<string, unknown> }) {
  if (!hasQrContext(search)) {
    return <PublicHome />;
  }

  return (
    <PatientShell search={search}>
      <PatientHomeContent />
    </PatientShell>
  );
}
