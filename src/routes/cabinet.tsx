import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  HelpCircle,
  Printer,
  QrCode,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { CabinetPoster, type PosterData } from "@/components/CabinetPoster";
import { DoctorSummary } from "@/components/DoctorSummary";
import { conditions, triageQuestions, type TriageOption } from "@/lib/conditions";

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

const demoCondition = conditions.find((c) => c.id === "entorse-cheville")!;
const demoAnswers: TriageOption[] = [
  triageQuestions[0]!.options[1]!, // appui possible mais douloureux
  triageQuestions[1]!.options[1]!, // 2 jours à 6 semaines
  triageQuestions[2]!.options[2]!, // aucun signe d'alerte
];

function CabinetPage() {
  const [poster, setPoster] = useState<PosterData>({
    cabinetName: "Cabinet médical",
    doctorName: "",
    message: "Préparez votre consultation en 2 minutes. Aucune donnée enregistrée.",
    url: "",
    qr: null,
  });

  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const target = `${window.location.origin}/orientation`;
    setPoster((prev) => ({ ...prev, url: target }));
    let cancelled = false;
    void import("qrcode").then(async (mod) => {
      const dataUrl = await mod.default.toDataURL(target, { width: 640, margin: 1, errorCorrectionLevel: "H" });
      if (!cancelled) setPoster((prev) => ({ ...prev, qr: dataUrl }));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updatePoster = (patch: Partial<PosterData>) => setPoster((prev) => ({ ...prev, ...patch }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Hero */}
      <section className="text-center print:hidden">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-care/20 bg-care/5 px-3 py-1 text-xs font-medium text-care">
          <Stethoscope className="h-3.5 w-3.5" />
          Pour les professionnels de santé
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Gagnez du temps à chaque consultation
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Vos patients préparent leur entretien en salle d'attente. Ils vous présentent une synthèse structurée que vous
          copiez dans votre logiciel en un clic. Aucune donnée n'est enregistrée.
        </p>
      </section>

      {/* Value props */}
      <section className="mt-12 grid gap-6 sm:grid-cols-3 print:hidden">
        <ValueCard
          icon={Clock}
          title="- 3 à 5 min par patient"
          text="Le recueil déclaratif (localisation, appui, ancienneté, signaux d'alerte) est déjà fait à votre arrivée."
        />
        <ValueCard
          icon={ShieldCheck}
          title="Zéro donnée conservée"
          text="Les réponses restent dans le navigateur du patient et disparaissent à la fermeture. Rien n'est transmis ni hébergé."
        />
        <ValueCard
          icon={QrCode}
          title="Zéro installation"
          text="Ni compte, ni application à installer, ni intégration technique avec votre logiciel médical."
        />
      </section>

      {/* How it works */}
      <section className="mt-16 print:hidden">
        <h2 className="text-center text-2xl font-semibold text-foreground">Comment ça marche dans votre cabinet</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <StepCard
            number={1}
            icon={Printer}
            title="Imprimez l'affiche"
            text="Personnalisez le nom de votre cabinet et imprimez le QR code en quelques clics."
          />
          <StepCard
            number={2}
            icon={Users}
            title="Le patient scanne"
            text="En salle d'attente, le patient répond à 3 questions expliquées sur son téléphone."
          />
          <StepCard
            number={3}
            icon={ClipboardCheck}
            title="Vous copiez la synthèse"
            text="En consultation, le patient montre son écran. Un bouton copie le résumé prêt à coller."
          />
        </div>
      </section>

      {/* Poster editor */}
      <section className="mt-16 poster-section">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Votre affiche de salle d'attente</h2>
            <p className="mt-1 text-muted-foreground">
              Personnalisez le texte, puis imprimez ou affichez sur un écran.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-care px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-care/90 print:hidden"
          >
            <Printer className="h-4 w-4" />
            Imprimer l'affiche
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 print:hidden">
            <div>
              <label htmlFor="cabinetName" className="block text-sm font-medium text-foreground">
                Nom du cabinet
              </label>
              <input
                id="cabinetName"
                type="text"
                value={poster.cabinetName}
                onChange={(e) => updatePoster({ cabinetName: e.target.value })}
                placeholder="Cabinet médical du Dr Martin"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="doctorName" className="block text-sm font-medium text-foreground">
                Nom du praticien (optionnel)
              </label>
              <input
                id="doctorName"
                type="text"
                value={poster.doctorName}
                onChange={(e) => updatePoster({ doctorName: e.target.value })}
                placeholder="Martin"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="posterMessage" className="block text-sm font-medium text-foreground">
                Message affiché
              </label>
              <textarea
                id="posterMessage"
                rows={2}
                value={poster.message}
                onChange={(e) => updatePoster({ message: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="rounded-xl border border-soothe/40 bg-soothe/20 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-soothe-foreground">
                <HelpCircle className="h-4 w-4" />
                Conseil
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Placez l'affiche près des sièges de la salle d'attente. Le patient scanne, répond et montre le résultat
                en consultation.
              </p>
            </div>
          </div>

          <div className="flex items-start justify-center">
            <CabinetPoster data={poster} />
          </div>
        </div>
      </section>

      {/* Demo summary */}
      <section className="mt-16 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Exemple de synthèse patient</h2>
            <p className="mt-1 text-muted-foreground">Voici ce que le médecin voit après le questionnaire.</p>
          </div>
          <button
            onClick={() => setShowDemo((s) => !s)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <FileText className="h-4 w-4" />
            {showDemo ? "Masquer l'exemple" : "Voir un exemple"}
          </button>
        </div>

        {showDemo && (
          <div className="mt-6">
            <DoctorSummary condition={demoCondition} answers={demoAnswers} level="professional" />
          </div>
        )}
      </section>

      {/* Legal / positioning */}
      <section className="mt-16 rounded-2xl border border-border bg-card p-6 md:p-8 print:hidden">
        <h2 className="text-xl font-semibold text-foreground">Positionnement réglementaire</h2>
        <ul className="mt-4 space-y-3">
          <li className="flex items-start gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-care" />
            Kivoir est un outil d'information et d'aide au recueil déclaratif du patient.
          </li>
          <li className="flex items-start gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-care" />
            Il ne pose aucun diagnostic, ne propose aucun traitement et ne constitue pas une aide à la décision médicale
            : il n'entre pas dans le champ du dispositif médical.
          </li>
          <li className="flex items-start gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-care" />
            Aucune donnée de santé n'est collectée, transmise ni hébergée. Le patient reste maître de ses réponses.
          </li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="mt-16 print:hidden">
        <h2 className="text-2xl font-semibold text-foreground">Questions fréquentes</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <FaqCard
            question="Est-ce que mes patients doivent créer un compte ?"
            answer="Non. Ils scannent le QR code, répondent au questionnaire et voient le résultat directement."
          />
          <FaqCard
            question="Où vont les données ?"
            answer="Nulle part. Les réponses restent dans le navigateur du patient et disparaissent quand il ferme l'onglet."
          />
          <FaqCard
            question="Comment le médecin récupère-t-il la synthèse ?"
            answer='Le patient montre son écran. Le médecin appuie sur "Copier la synthèse" et la colle dans son logiciel.'
          />
          <FaqCard
            question="Kivoir remplace-t-il l'examen clinique ?"
            answer="Non. C'est un recueil déclaratif pour gagner du temps ; le diagnostic reste clinique."
          />
        </div>
      </section>

      <div className="mt-10 print:hidden">
        <MedicalDisclaimer />
      </div>
    </main>
  );
}

function ValueCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-care/10 text-care">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function StepCard({
  number,
  icon: Icon,
  title,
  text,
}: {
  number: number;
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
      <span className="absolute -top-3 left-6 flex h-6 w-6 items-center justify-center rounded-full bg-care text-xs font-semibold text-primary-foreground">
        {number}
      </span>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-care/10 text-care">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function FaqCard({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="flex items-start gap-2 font-semibold text-card-foreground">
        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-care" />
        {question}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{answer}</p>
    </div>
  );
}
