import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, Printer, QrCode, ShieldCheck } from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";

export const Route = createFileRoute("/cabinet")({
  head: () => ({
    meta: [
      { title: "Espace cabinet — Kivoir" },
      {
        name: "description",
        content:
          "Affichez un QR code en salle d'attente : le patient prépare son questionnaire musculo-squelettique et présente une synthèse prête à coller, sans aucune donnée enregistrée.",
      },
      { property: "og:title", content: "Espace cabinet — Kivoir" },
      {
        property: "og:description",
        content:
          "QR code de salle d'attente et synthèse pré-consultation pour les troubles musculo-squelettiques du membre inférieur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CabinetPage,
});

function CabinetPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const target = `${window.location.origin}/orientation`;
    setUrl(target);
    let cancelled = false;
    void import("qrcode").then(async (mod) => {
      const dataUrl = await mod.default.toDataURL(target, { width: 640, margin: 1 });
      if (!cancelled) setQr(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Espace cabinet</h1>
      <p className="mt-2 text-muted-foreground">
        Le patient scanne le QR code en salle d'attente, répond en deux minutes, puis vous présente sa synthèse à
        l'écran. Vous la copiez dans votre logiciel métier en un clic.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <InfoCard
          icon={Clock}
          title="Temps gagné"
          text="Le recueil déclaratif (localisation, appui, ancienneté, signaux d'alerte) est déjà fait à votre arrivée."
        />
        <InfoCard
          icon={ShieldCheck}
          title="Aucune donnée conservée"
          text="Les réponses restent dans le navigateur du patient et disparaissent à la fermeture. Rien n'est transmis ni hébergé."
        />
        <InfoCard
          icon={QrCode}
          title="Zéro installation"
          text="Ni compte, ni application à installer, ni intégration à votre logiciel."
        />
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm print:border-0 print:shadow-none">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-care">Affiche de salle d'attente</p>
          <h2 className="text-xl font-semibold text-card-foreground">
            Douleur au genou, à la cheville, à la hanche ou au pied ?
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Scannez ce code et préparez votre consultation en deux minutes. Aucune donnée n'est enregistrée.
          </p>
          {qr ? (
            <img src={qr} alt="QR code vers le questionnaire patient Kivoir" className="h-56 w-56" />
          ) : (
            <div className="h-56 w-56 animate-pulse rounded-xl bg-muted" />
          )}
          <p className="break-all text-xs text-muted-foreground">{url}</p>
        </div>
      </section>

      <button
        onClick={() => window.print()}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-care px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-care/90 print:hidden"
      >
        <Printer className="h-4 w-4" />
        Imprimer l'affiche
      </button>

      <section className="mt-8 rounded-2xl border border-border bg-muted/50 p-6 print:hidden">
        <h2 className="font-semibold text-foreground">Positionnement réglementaire</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Kivoir est un outil d'information et d'aide au recueil déclaratif du patient. Il ne pose aucun diagnostic, ne
          propose aucun traitement et ne constitue pas une aide à la décision médicale : il n'entre donc pas dans le
          champ du dispositif médical. Aucune donnée de santé n'est collectée, transmise ni hébergée.
        </p>
      </section>

      <div className="mt-8 print:hidden">
        <MedicalDisclaimer />
      </div>
    </main>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Icon className="h-5 w-5 text-care" />
      <p className="mt-2 font-medium text-card-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
