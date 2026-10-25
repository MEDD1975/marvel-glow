import { Link } from "@tanstack/react-router";
import { Activity, ChevronRight, MapPin, QrCode, Stethoscope } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PatientShell } from "@/components/patient/PatientShell";
import { PatientHomeContent } from "@/components/patient/PatientHomeContent";

function hasQrContext(search: Record<string, unknown>) {
  return Boolean(
    (typeof search["pathway"] === "string" && search["pathway"].trim()) ||
      (typeof search["ref"] === "string" && search["ref"].trim()),
  );
}

const cardClass =
  "flex items-center gap-4 rounded-[22px] border border-[#D8E5F3] bg-white px-5 py-5 shadow-[0_4px_12px_rgba(16,28,51,0.05)] transition-all hover:-translate-y-0.5 hover:border-[#0B63CE] hover:shadow-[0_8px_20px_rgba(11,99,206,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]";

function PublicHome() {
  return (
    <main className="min-h-dvh bg-[#F7FAFE]">
      <header className="mx-auto flex max-w-2xl items-center px-5 pt-6">
        <Logo size="sm" />
      </header>

      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-5 pb-16 pt-10">
        <section aria-labelledby="hero-title" className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0B63CE]">
            Douleurs de la jambe, de la cheville ou du pied
          </p>
          <h1
            id="hero-title"
            className="mt-3 text-balance text-4xl font-bold tracking-[-0.03em] text-[#101C33] md:text-5xl"
          >
            Qui voir, quand&nbsp;?
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-[#526176] md:text-lg">
            Kivoir vous aide à vous orienter et à retrouver les conseils transmis par votre
            professionnel de santé, entre deux rendez-vous.
          </p>
        </section>

        <nav aria-label="Accès principaux" className="flex flex-col gap-3">
          <Link to="/orientation" className={cardClass}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E3EEFF] text-[#1764C0]">
              <Activity className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[1.08rem] font-bold leading-snug text-[#101C33]">
                J&apos;ai mal, je ne sais pas qui consulter
              </span>
              <span className="mt-1 block text-[0.98rem] leading-snug text-[#526176]">
                Quelques questions pour vous orienter vers le bon professionnel.
              </span>
            </span>
            <ChevronRight className="h-6 w-6 shrink-0 text-[#0B63CE]" aria-hidden="true" />
          </Link>

          <Link to="/annuaire" className={cardClass}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E5F6EE] text-[#16845B]">
              <MapPin className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[1.08rem] font-bold leading-snug text-[#101C33]">
                Trouver un professionnel près de chez moi
              </span>
              <span className="mt-1 block text-[0.98rem] leading-snug text-[#526176]">
                Les professionnels recommandés par les cabinets, autour de Saint-Maur-des-Fossés.
              </span>
            </span>
            <ChevronRight className="h-6 w-6 shrink-0 text-[#0B63CE]" aria-hidden="true" />
          </Link>

          <Link to="/connexion-medecin" className={cardClass}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0CF] text-[#9A6100]">
              <Stethoscope className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[1.08rem] font-bold leading-snug text-[#101C33]">
                Vous êtes professionnel de santé&nbsp;?
              </span>
              <span className="mt-1 block text-[0.98rem] leading-snug text-[#526176]">
                Transmettez vos conseils à vos patients en un scan, sans création de compte patient.
              </span>
            </span>
            <ChevronRight className="h-6 w-6 shrink-0 text-[#0B63CE]" aria-hidden="true" />
          </Link>
        </nav>

        <section
          aria-label="Accès par QR code"
          className="flex items-start gap-3 rounded-2xl border border-[#C9DCF3] bg-[#EAF3FF] px-4 py-4"
        >
          <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-[#0B63CE]" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-[#33445D]">
            <span className="font-semibold text-[#101C33]">Votre médecin vous a remis un QR code&nbsp;?</span>{" "}
            Scannez-le avec votre téléphone pour retrouver les conseils et les contacts qu&apos;il a
            transmis pour votre parcours.
          </p>
        </section>

        <p className="text-center text-xs leading-relaxed text-[#6B7A90]">
          Kivoir est un outil d&apos;information et d&apos;orientation. Il ne remplace pas une
          consultation ni l&apos;avis d&apos;un professionnel de santé. En cas d&apos;urgence,
          appelez le 15 ou le 112.
        </p>
      </div>
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
