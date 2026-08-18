import { useEffect, useState } from "react";
import { ClipboardCheck, Copy, Maximize2, QrCode, ShieldCheck, X } from "lucide-react";
import QRCodeLib from "qrcode";
import { buildDoctorSummary } from "@/lib/summary";
import { zoneDescriptions, type TriageOption, type TriageQuestion, type Zone } from "@/lib/conditions";

/**
 * Synthèse de pré-consultation à montrer ou coller au médecin.
 * Générée localement : rien n'est enregistré ni transmis.
 * Strictement déclaratif : aucun nom de diagnostic ni orientation n'est affiché.
 */
export function DoctorSummary({
  zone,
  answers,
  questions,
}: {
  zone: Zone;
  answers: TriageOption[];
  questions: TriageQuestion[];
}) {
  const [copied, setCopied] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);
  const text = buildDoctorSummary(zone, answers, questions);

  useEffect(() => {
    if (!showQr) return;
    let active = true;
    QRCodeLib.toDataURL(text, { errorCorrectionLevel: "L", margin: 1, width: 720 })
      .then((url) => {
        if (active) {
          setQrUrl(url);
          setQrError(false);
        }
      })
      .catch(() => active && setQrError(true));
    return () => {
      active = false;
    };
  }, [showQr, text]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const rows = answers.map((answer, i) => ({
    question: questions[i]?.question ?? `Question ${i + 1}`,
    answer: answer.label,
  }));

  const content = (big: boolean) => (
    <div className={big ? "space-y-5" : "space-y-4"}>
      <div>
        <p className={big ? "text-sm uppercase tracking-wide text-muted-foreground" : "text-xs uppercase tracking-wide text-muted-foreground"}>
          Zone décrite (déclaratif patient)
        </p>
        <p className={big ? "text-3xl font-bold text-foreground" : "text-lg font-semibold text-foreground"}>
          {zone}
        </p>
        <p className={big ? "text-lg text-muted-foreground" : "text-sm text-muted-foreground"}>{zoneDescriptions[zone]}</p>
      </div>

      <dl className={big ? "space-y-4" : "space-y-3"}>
        {rows.map((row) => (
          <div key={row.question} className="rounded-lg border border-border bg-background p-3">
            <dt className={big ? "text-base text-muted-foreground" : "text-xs text-muted-foreground"}>{row.question}</dt>
            <dd className={big ? "mt-1 text-2xl font-semibold text-foreground" : "mt-0.5 text-base font-medium text-foreground"}>
              {row.answer}
            </dd>
          </div>
        ))}
      </dl>

      <p className={big ? "text-base text-muted-foreground" : "text-xs text-muted-foreground"}>
        Recueil déclaratif du patient. Ne constitue ni un diagnostic ni une orientation.
      </p>
    </div>
  );

  return (
    <>
      <section className="rounded-xl border border-care/20 bg-care/5 p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">À montrer à votre médecin</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Montrez cet écran en consultation. Le médecin peut copier le texte en un clic.
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 print:hidden">
          <button
            onClick={() => setHandoff(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-care px-4 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-care/90"
          >
            <Maximize2 className="h-4 w-4" />
            Passer au médecin
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg border border-care/40 px-4 py-3 text-base font-medium text-care transition-colors hover:bg-care/10"
          >
            {copied ? <ClipboardCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copié" : "Copier la synthèse"}
          </button>
        </div>

        <div className="mt-4">{content(false)}</div>

        <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-care" />
          Aucune donnée n'est enregistrée ni envoyée : cette synthèse existe uniquement dans votre navigateur et disparaît
          quand vous fermez la page.
        </p>
      </section>

      {handoff && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background p-5 sm:p-8">
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <p className="min-w-0 truncate text-sm font-semibold uppercase tracking-wide text-care">
                Synthèse Kivoir — pré-consultation
              </p>
              <button
                onClick={() => setHandoff(false)}
                aria-label="Fermer"
                className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5">{content(true)}</div>

            <div className="mt-6 rounded-xl border border-care/30 bg-care/5 p-4">
              <button
                onClick={() => setShowQr((v) => !v)}
                className="inline-flex items-center gap-2 text-base font-semibold text-care"
              >
                <QrCode className="h-5 w-5" />
                {showQr ? "Masquer le QR code" : "Afficher le QR code pour le médecin"}
              </button>
              <p className="mt-1 text-sm text-muted-foreground">
                Le médecin scanne ce code depuis son ordinateur : le texte de la synthèse s'affiche chez lui, prêt à
                coller dans le dossier. Rien ne transite par un serveur.
              </p>
              {showQr && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  {qrError ? (
                    <p className="text-sm text-destructive">
                      Synthèse trop longue pour un QR code lisible : utilisez le bouton copier.
                    </p>
                  ) : qrUrl ? (
                    <img
                      src={qrUrl}
                      alt="QR code contenant la synthèse de pré-consultation"
                      className="h-64 w-64 rounded-lg bg-white p-2"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Génération du QR code…</p>
                  )}
                  <p className="text-xs text-muted-foreground">Augmentez la luminosité de l'écran pour faciliter le scan.</p>
                </div>
              )}
            </div>

            <button
              onClick={handleCopy}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-care px-4 py-4 text-lg font-semibold text-primary-foreground hover:bg-care/90"
            >
              {copied ? <ClipboardCheck className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              {copied ? "Copié dans le presse-papiers" : "Copier pour le dossier patient"}
            </button>

            <p className="mt-4 text-sm text-muted-foreground">
              Déclaratif patient. Ne constitue ni un diagnostic, ni une aide à la décision médicale. Aucune donnée n'est
              stockée.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
