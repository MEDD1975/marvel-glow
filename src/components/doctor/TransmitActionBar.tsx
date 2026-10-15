import { useState } from "react";
import { Check, ChevronDown, Copy, Eye, Maximize2, Printer, Share2 } from "lucide-react";
import { useCopyLink, type TransmitActions } from "@/components/doctor/QRTransmissionCard";
import { cn } from "@/lib/utils";

type Props = TransmitActions & { pathwayName: string; url: string; qrReady: boolean };

/** Accès immédiat au QR sur mobile et tablette, posé juste au-dessus de la navigation inférieure. */
export function TransmitActionBar({ pathwayName, url, qrReady, onFullscreen, onPrint, onShare, onPreview }: Props) {
  const [open, setOpen] = useState(false);
  const { copyState, copyLink } = useCopyLink(url);
  const option = "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium text-foreground hover:bg-muted disabled:opacity-50";

  return (
    <div
      className="fixed inset-x-0 z-30 px-3 print:hidden lg:hidden bottom-[calc(3.5rem+1px+env(safe-area-inset-bottom))] md:bottom-[max(0.75rem,env(safe-area-inset-bottom))] md:left-64 md:px-6"
      role="region"
      aria-label="Transmission du parcours sélectionné"
    >
      <div className="mx-auto max-w-xl rounded-2xl border border-care/25 bg-card/95 p-2 shadow-[0_10px_30px_-10px_rgba(16,35,72,0.4)] backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 pl-1.5">
            <p className="truncate text-sm font-semibold text-foreground" title={pathwayName}>{pathwayName}</p>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="transmit-options"
              className="-ml-1 inline-flex min-h-7 items-center gap-0.5 rounded-md px-1 text-xs font-medium text-care"
            >
              {open ? "Masquer les options" : "Voir les options"}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            onClick={onFullscreen}
            disabled={!qrReady}
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-care px-4 text-sm font-semibold text-care-foreground shadow-sm disabled:opacity-50"
          >
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
            Afficher le QR
          </button>
        </div>
        <span className="sr-only">{pathwayName} sélectionnée</span>
        {open ? (
          <div id="transmit-options" className="mt-2 grid grid-cols-4 gap-1 border-t border-border pt-2">
            <button type="button" onClick={onPrint} disabled={!qrReady} className={option}><Printer className="h-4 w-4" aria-hidden="true" />Imprimer</button>
            <button type="button" onClick={() => void onShare()} disabled={!qrReady} className={option}><Share2 className="h-4 w-4" aria-hidden="true" />Partager</button>
            <button type="button" onClick={() => void copyLink()} className={option}>
              {copyState === "copied" ? <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copyState === "copied" ? "Copié" : "Copier le lien"}
            </button>
            <button type="button" onClick={onPreview} className={option}><Eye className="h-4 w-4" aria-hidden="true" />Prévisualiser</button>
          </div>
        ) : null}
        <p aria-live="polite" className="sr-only">{copyState === "copied" ? "Lien copié dans le presse-papiers" : ""}</p>
        {copyState === "error" ? <p role="alert" className="mt-1 break-all px-1.5 text-xs text-destructive">Copie impossible : {url}</p> : null}
      </div>
    </div>
  );
}
