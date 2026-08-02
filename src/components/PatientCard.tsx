import { cn } from "@/lib/utils";

export interface PatientCardData {
  cabinetName: string;
  doctorName: string;
  url: string;
  qr: string | null;
}

export interface PatientCardProps {
  data: PatientCardData;
  className?: string;
}

/**
 * Carte de poche remise au patient en fin de consultation :
 * il retrouve chez lui les informations sur son trouble, son parcours de soins
 * et les vidéos d'exercices. Aucune donnée n'est enregistrée.
 */
export function PatientCard({ data, className }: PatientCardProps) {
  const { cabinetName, doctorName, url, qr } = data;

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
        <p className="text-[9px] font-semibold uppercase tracking-widest text-care">Kivoir — qui voir, quand</p>
        <p className="mt-1 text-[11px] font-semibold leading-snug text-foreground">
          Retrouvez chez vous les informations sur votre douleur
        </p>
        <ul className="mt-1.5 space-y-0.5 text-[9px] leading-snug text-muted-foreground">
          <li>• Comprendre votre trouble</li>
          <li>• Savoir qui consulter et quand</li>
          <li>• Vidéos et exercices adaptés</li>
        </ul>
        <p className="mt-1.5 truncate text-[8px] text-muted-foreground">{url}</p>
        <p className="mt-1 truncate text-[9px] font-medium text-foreground">
          {cabinetName || "Cabinet médical"}
          {doctorName ? ` — Dr ${doctorName}` : ""}
        </p>
      </div>
    </div>
  );
}
