import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { conditions } from "@/lib/conditions";
import { PatientCard } from "@/components/PatientCard";
import { DoctorPage } from "@/components/doctor/DoctorLayout";
import { PathwaySelector } from "@/components/doctor/PathwaySelector";
import { QRTransmissionCard } from "@/components/doctor/QRTransmissionCard";
import { QRFullscreenModal } from "@/components/doctor/QRFullscreenModal";
import { PathwaySummary } from "@/components/doctor/PathwaySummary";
import { TransmitActionBar } from "@/components/doctor/TransmitActionBar";
import { useDoctorResources, usePathwaySettings } from "@/components/doctor/use-doctor-data";
import { buildPatientLink, doctorGreetingName, findCondition, getPathwayStats, openPatientPreview } from "@/lib/doctor-pathway-info";

export const Route = createFileRoute("/cabinet/")({
  head: () => ({
    meta: [
      { title: "Transmettre un parcours — Kivoir" },
      { name: "description", content: "Sélectionnez une atteinte, puis présentez le QR code au patient." },
    ],
  }),
  component: TransmitPage,
});

function TransmitPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search as { view?: string; pathway?: string };
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const resources = useDoctorResources();
  const settings = usePathwaySettings();

  const [pathway, setPathway] = useState<string | null>(() => (findCondition(search.pathway) ? search.pathway ?? null : null));
  const [qr, setQr] = useState<{ url: string; image: string | null }>({ url: "", image: null });
  const [fullscreen, setFullscreen] = useState(false);
  const qrCardRef = useRef<HTMLDivElement>(null);

  // Anciennes URL (?view=network / ?view=resources) redirigées vers les nouveaux écrans.
  useEffect(() => {
    if (search.view === "network") void navigate({ to: "/cabinet/professionnels", replace: true });
    if (search.view === "resources") void navigate({ to: "/cabinet/ressources", replace: true });
  }, [navigate, search.view]);

  const hiddenIds = useMemo(() => new Set((settings.data ?? []).filter((item) => item.hidden).map((item) => item.conditionId)), [settings.data]);
  const visibleConditions = conditions.filter((condition) => !hiddenIds.has(condition.id) || condition.id === pathway);
  const condition = findCondition(pathway ?? undefined);
  const stats = condition ? getPathwayStats(condition.id, resources.data ?? []) : null;

  useEffect(() => {
    if (!pathway) return;
    const target = buildPatientLink(window.location.origin, pathway, user);
    setQr({ url: target, image: null });
    let cancelled = false;
    void import("qrcode").then(async (mod) => {
      const image = await mod.default.toDataURL(target, { width: 480, margin: 1, errorCorrectionLevel: "H" });
      if (!cancelled) setQr({ url: target, image });
    });
    return () => {
      cancelled = true;
    };
  }, [pathway, user]);

  const selectPathway = (id: string) => {
    setPathway(id);
  };

  const print = () => {
    document.body.classList.add("printing-cards");
    window.print();
    window.setTimeout(() => document.body.classList.remove("printing-cards"), 500);
  };

  const share = async () => {
    if (!qr.image || !condition) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Kivoir — ${condition.name}`, text: "Vos conseils de suivi Kivoir", url: qr.url });
        return;
      }
      const link = document.createElement("a");
      link.href = qr.image;
      link.download = "kivoir-qr-code.png";
      link.click();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("[v0] share failed", error);
    }
  };

  const exportPdf = async () => {
    if (!qr.image) return;
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    pdf.setTextColor(16, 35, 72);
    pdf.setFontSize(18);
    pdf.text("Kivoir — Parcours patient", 20, 24);
    pdf.setTextColor(60, 72, 90);
    pdf.setFontSize(11);
    pdf.text("Scannez ce QR code pour accéder au parcours patient.", 20, 34);
    pdf.addImage(qr.image, "PNG", 20, 48, 82, 82);
    pdf.setFontSize(10);
    pdf.text("Lien :", 20, 144);
    pdf.text(pdf.splitTextToSize(qr.url, 165), 20, 151);
    pdf.save("kivoir-parcours-patient.pdf");
  };

  const greeting = doctorGreetingName(user?.name);

  return (
    <DoctorPage>
      <header className="-mt-2 print:hidden md:mt-0">
        <p className="text-sm font-medium text-care">{greeting ? `Bonjour ${greeting}` : "Bonjour"}</p>
        <h1 className="mt-0.5 text-balance text-xl font-semibold tracking-tight text-foreground md:text-3xl">Transmettre un parcours</h1>
        <p className="mt-1 text-pretty text-sm text-muted-foreground md:text-base">Sélectionnez l’atteinte diagnostiquée pour transmettre le parcours correspondant.</p>
      </header>

      <div className={`mt-4 grid gap-5 print:hidden lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start xl:grid-cols-[minmax(0,1fr)_360px] ${condition ? "pb-24 lg:pb-0" : ""}`}>
        <div className="flex min-w-0 flex-col gap-3">
          <PathwaySelector conditions={visibleConditions} selectedId={pathway} onSelect={selectPathway} />
          {hiddenIds.size ? (
            <p className="text-xs text-muted-foreground">
              {hiddenIds.size} parcours masqué{hiddenIds.size > 1 ? "s" : ""}.{" "}
              <Link to="/cabinet/parcours" className="font-medium text-care underline-offset-2 hover:underline">Gérer mes parcours</Link>
            </p>
          ) : null}
        </div>

        <div ref={qrCardRef} className="flex scroll-mt-20 flex-col gap-3 lg:sticky lg:top-6">
          <QRTransmissionCard
            pathwayName={condition?.name ?? null}
            zone={condition?.zone ?? null}
            stats={stats}
            qr={qr.image}
            url={qr.url}
            onFullscreen={() => setFullscreen(true)}
            onPrint={print}
            onShare={share}
            onExportPdf={() => void exportPdf()}
            onPreview={() => condition && openPatientPreview(condition.id, user)}
          />
          {condition && stats ? (
            <>
              <PathwaySummary stats={stats} />
            </>
          ) : null}
        </div>
      </div>

      {condition ? (
        <>
          <TransmitActionBar
            pathwayName={condition.name}
            url={qr.url}
            qrReady={Boolean(qr.image)}
            onFullscreen={() => setFullscreen(true)}
            onPrint={print}
            onShare={share}
            onPreview={() => openPatientPreview(condition.id, user)}
          />
          <QRFullscreenModal open={fullscreen} onOpenChange={setFullscreen} qr={qr.image} pathwayName={condition.name} />
          <div className="card-section hidden">
            <div className="card-sheet hidden print:flex">
              <PatientCard data={{ url: qr.url, qr: qr.image, cabinetName: "Cabinet médical", doctorName: "", pathwayLabel: condition.name }} />
            </div>
          </div>
        </>
      ) : null}
    </DoctorPage>
  );
}
