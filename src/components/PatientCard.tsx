import { cn } from "@/lib/utils";

export interface PatientCardData {
  cabinetName: string;
  doctorName: string;
  url: string;
  qr: string | null;
  pathwayLabel?: string;
  note?: string;
}

export interface PatientCardProps {
  data: PatientCardData;
  className?: string;
}

/**
 * Carte de poche remise au patient : elle ouvre directement la feuille de route
 * pour retrouver la prochaine étape et les consignes du professionnel.
 */
export function PatientCard({ data, className }: PatientCardProps) {
  const { cabinetName, doctorName, url, qr, pathwayLabel, note } = data;

  return (
    <div
      className={cn(
        "patient-card flex w-[85mm] items-center gap-4 rounded-xl border border-care/20 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="shrink-0">
        {qr ? (
          <img src={qr} alt="QR code vers Kivoir" className="h-[26mm] w-[26mm]" />
        ) : (
          <div className="h-[26mm] w-[26mm] animate-pulse rounded-md bg-muted" />
        )}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-care">Kivoir — votre parcours de soin</p>
        <p className="mt-1 text-[11px] font-semibold leading-snug text-foreground">
          {pathwayLabel ? pathwayLabel : "Retrouvez votre parcours après la consultation"}
        </p>
        <ul className="mt-1.5 space-y-0.5 text-[9px] leading-snug text-muted-foreground">
          <li>• Conseils et vidéos adaptés</li>
          <li>• La suite de votre parcours</li>
          <li>• Les professionnels à consulter</li>
        </ul>
        {note ? (
          <p className="mt-1.5 rounded bg-care/10 px-1.5 py-1 text-[9px] font-medium leading-snug text-care">{note}</p>
        ) : null}
        <p className="mt-1.5 truncate text-[8px] text-muted-foreground">{url}</p>
        <p className="mt-1 truncate text-[9px] font-medium text-foreground">
          {cabinetName || "Cabinet médical"}
          {doctorName ? ` — Dr ${doctorName}` : ""}
        </p>
      </div>
    </div>
  );
}
