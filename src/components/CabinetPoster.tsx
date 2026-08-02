import { useEffect, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export interface PosterData {
  cabinetName: string;
  doctorName: string;
  message: string;
  url: string;
  qr: string | null;
}

const posterVariants = cva(
  "flex flex-col items-center justify-center rounded-2xl border border-care/20 bg-white p-8 text-center shadow-sm",
  {
    variants: {
      size: {
        default: "w-full max-w-md",
        print: "w-[210mm] max-w-[210mm] rounded-none border-0 shadow-none p-12",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface CabinetPosterProps extends VariantProps<typeof posterVariants> {
  data: PosterData;
  className?: string;
}

export function CabinetPoster({ data, size, className }: CabinetPosterProps) {
  const { cabinetName, doctorName, message, url, qr } = data;

  return (
    <div className={cn("poster-root", posterVariants({ size }), className)}>
      <p className="text-xs font-semibold uppercase tracking-widest text-care">Questionnaire pré-consultation</p>

      <h2 className="mt-4 text-2xl font-semibold text-foreground">
        Douleur au genou, à la cheville, à la hanche ou au pied ?
      </h2>

      <p className="mt-3 max-w-xs text-sm text-muted-foreground">{message}</p>

      <div className="mt-6">
        {qr ? (
          <img src={qr} alt="QR code vers le questionnaire Kivoir" className="h-48 w-48" />
        ) : (
          <div className="h-48 w-48 animate-pulse rounded-xl bg-muted" />
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">Scannez ce code avec votre téléphone</p>

      <div className="mt-6 space-y-1">
        <p className="text-base font-semibold text-foreground">{cabinetName || "Cabinet médical"}</p>
        {doctorName && <p className="text-sm text-muted-foreground">Dr {doctorName}</p>}
      </div>

      <p className="mt-6 break-all text-[10px] text-muted-foreground">{url}</p>

      <p className="mt-6 max-w-xs text-[10px] text-muted-foreground">
        Outil d'information et d'aide au recueil déclaratif. Aucune donnée de santé n'est enregistrée, transmise ni
        hébergée.
      </p>
    </div>
  );
}
