import { useState } from "react";
import { Check, Copy, Eye, FileDown, Maximize2, Printer, QrCode, Share2 } from "lucide-react";
import { EmptyState } from "@/components/doctor/states";
import type { Zone } from "@/lib/conditions";
import type { PathwayStats } from "@/lib/doctor-pathway-info";
import { zoneVisuals } from "@/lib/zone-visuals";

export function useCopyLink(url: string) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    window.setTimeout(() => setCopyState("idle"), 2500);
  };
  return { copyState, copyLink };
}

export type TransmitActions = {
  onFullscreen: () => void;
  onPrint: () => void;
  onShare: () => Promise<void>;
  onPreview: () => void;
};

type Props = TransmitActions & {
  pathwayName: string | null;
  zone: Zone | null;
  stats: PathwayStats | null;
  qr: string | null;
  url: string;
  onExportPdf: () => void;
};

export function QRTransmissionCard({ pathwayName, zone, stats, qr, url, onFullscreen, onPrint, onShare, onExportPdf, onPreview }: Props) {
  const { copyState, copyLink } = useCopyLink(url);

  if (!pathwayName) {
    return (
      <section aria-label="QR code patient" className="rounded-2xl border border-dashed border-care/40 bg-card/70 p-4">
        <EmptyState className="border-0 bg-transparent py-8" title="Aucune atteinte sélectionnée" description="Choisissez une atteinte pour générer le QR code du patient." />
      </section>
    );
  }

  const counts = stats
    ? [
        { value: stats.recommendations, one: "recommandation", many: "recommandations" },
        { value: stats.documents, one: "document", many: "documents" },
        { value: stats.videos, one: "vidéo", many: "vidéos" },
        { value: stats.exercises, one: "exercice", many: "exercices" },
      ]
        .filter((item) => item.value > 0)
        .map((item) => ({ label: item.value > 1 ? item.many : item.one, value: item.value }))
    : [];

  const secondary = "flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50";

  return (
    <section aria-labelledby="qr-card-title" className="overflow-hidden rounded-2xl border border-care/25 bg-card shadow-[0_8px_24px_-12px_rgba(16,35,72,0.25)]">
      <div className="flex items-center gap-3 bg-care-muted/70 px-4 py-3">
        {zone ? <img src={zoneVisuals[zone].src} alt="" aria-hidden="true" className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-care/15" /> : null}
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-care">Parcours à transmettre</p>
          <h2 id="qr-card-title" className="text-pretty text-base font-semibold leading-snug text-foreground">{pathwayName}</h2>
        </div>
      </div>

      <div className="p-4">
        <div className="mx-auto flex max-w-[220px] justify-center rounded-xl bg-white p-3 ring-1 ring-border">
          {qr ? (
            <img src={qr} alt={`QR code du parcours ${pathwayName}`} className="aspect-square w-full" />
          ) : (
            <div role="status" className="flex aspect-square w-full items-center justify-center text-sm text-muted-foreground">
              <QrCode className="mr-2 h-5 w-5 animate-pulse" aria-hidden="true" />Génération…
            </div>
          )}
        </div>
        <p className="mt-3 text-pretty text-center text-sm text-muted-foreground">
          Ce QR ouvre directement le parcours <span className="font-medium text-foreground">{pathwayName}</span>.
        </p>

        {counts.length ? (
          <dl className="mt-3 grid grid-cols-2 gap-2">
            {counts.map((item) => (
              <div key={item.label} className="rounded-xl bg-muted/60 px-2 py-2 text-center">
                <dd className="text-lg font-semibold tabular-nums text-foreground">{item.value}</dd>
                <dt className="text-[11px] leading-tight text-muted-foreground">{item.label}</dt>
              </div>
            ))}
          </dl>
        ) : null}

        <button
          type="button"
          onClick={onFullscreen}
          disabled={!qr}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-care px-4 text-base font-semibold text-care-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Maximize2 className="h-5 w-5" aria-hidden="true" />
          Afficher le QR au patient
        </button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={onPrint} disabled={!qr} className={secondary}><Printer className="h-4 w-4" aria-hidden="true" />Imprimer</button>
          <button type="button" onClick={() => void onShare()} disabled={!qr} className={secondary}><Share2 className="h-4 w-4" aria-hidden="true" />Partager</button>
          <button type="button" onClick={() => void copyLink()} className={secondary}>
            {copyState === "copied" ? <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copyState === "copied" ? "Lien copié" : "Copier le lien"}
          </button>
          <button type="button" onClick={onPreview} className={secondary}><Eye className="h-4 w-4" aria-hidden="true" />Prévisualiser</button>
        </div>
        <button type="button" onClick={onExportPdf} disabled={!qr} className="mt-1 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50">
          <FileDown className="h-4 w-4" aria-hidden="true" />Exporter en PDF
        </button>
        <p aria-live="polite" className="sr-only">{copyState === "copied" ? "Lien copié dans le presse-papiers" : ""}</p>
        {copyState === "error" ? <p role="alert" className="mt-2 break-all text-sm text-destructive">Impossible de copier le lien. Sélectionnez-le manuellement : {url}</p> : null}
      </div>
    </section>
  );
}
