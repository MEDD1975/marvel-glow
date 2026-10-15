import { useState } from "react";
import { Check, Copy, Eye, FileDown, Maximize2, Printer, QrCode, Share2 } from "lucide-react";
import { EmptyState } from "@/components/doctor/states";

type Props = {
  pathwayName: string | null;
  qr: string | null;
  url: string;
  onFullscreen: () => void;
  onPrint: () => void;
  onShare: () => Promise<void>;
  onExportPdf: () => void;
  onPreview: () => void;
};

export function QRTransmissionCard({ pathwayName, qr, url, onFullscreen, onPrint, onShare, onExportPdf, onPreview }: Props) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  if (!pathwayName) {
    return (
      <section aria-label="QR code patient" className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <EmptyState className="border-0 py-12" title="Aucune atteinte sélectionnée" description="Choisissez une atteinte pour générer le QR code du patient." />
      </section>
    );
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    window.setTimeout(() => setCopyState("idle"), 2500);
  };

  const secondary = "flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50";

  return (
    <section aria-labelledby="qr-card-title" className="rounded-2xl border border-care/30 bg-card p-4 shadow-sm sm:p-5">
      <p className="text-xs font-medium text-muted-foreground">2. Transmettez le parcours</p>
      <h2 id="qr-card-title" className="mt-1 text-lg font-semibold text-foreground">{pathwayName}</h2>
      <div className="mt-4 flex justify-center rounded-xl bg-white p-4 ring-1 ring-border">
        {qr ? (
          <img src={qr} alt={`QR code du parcours ${pathwayName}`} className="aspect-square w-full max-w-[240px]" />
        ) : (
          <div role="status" className="flex aspect-square w-full max-w-[240px] items-center justify-center text-sm text-muted-foreground">
            <QrCode className="mr-2 h-5 w-5 animate-pulse" aria-hidden="true" />Génération…
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onFullscreen}
        disabled={!qr}
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-care px-4 text-base font-semibold text-care-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Maximize2 className="h-5 w-5" aria-hidden="true" />
        Afficher en plein écran
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
      <button type="button" onClick={onExportPdf} disabled={!qr} className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50">
        <FileDown className="h-4 w-4" aria-hidden="true" />Exporter en PDF
      </button>
      <p aria-live="polite" className="sr-only">{copyState === "copied" ? "Lien copié dans le presse-papiers" : ""}</p>
      {copyState === "error" ? <p role="alert" className="mt-2 text-sm text-destructive">Impossible de copier le lien. Sélectionnez-le manuellement : {url}</p> : null}
    </section>
  );
}
