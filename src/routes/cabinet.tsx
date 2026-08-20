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
  Video,
  Plus,
  Trash2,
} from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { conditions } from "@/lib/conditions";
import { getAllDoctorVideos, removeDoctorVideo, saveDoctorVideo, type DoctorVideo } from "@/lib/doctor-content";
import { CabinetPoster, type PosterData } from "@/components/CabinetPoster";
import { PatientCard } from "@/components/PatientCard";


export const Route = createFileRoute("/cabinet")({
  head: () => ({
    meta: [
      { title: "Espace cabinet — Kivoir" },
      {
        name: "description",
        content:
          "Créez une feuille de route simple : le patient comprend les étapes, prépare son échange et retrouve vos consignes après la consultation.",
      },
      { property: "og:title", content: "Espace cabinet — Kivoir" },
      {
        property: "og:description",
        content:
          "Un support partagé pour préparer la consultation et rendre la prochaine étape plus claire pour le patient.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CabinetPage,
});

function CabinetPage() {
  const [poster, setPoster] = useState<PosterData>({
    cabinetName: "Cabinet médical",
    doctorName: "",
    message: "Préparez le parcours de votre patient. Aucune donnée enregistrée.",
    url: "",
    qr: null,
  });

  const [cardQr, setCardQr] = useState<{ url: string; qr: string | null }>({ url: "", qr: null });

  const [showDemo, setShowDemo] = useState(false);
  const [videoCabinet, setVideoCabinet] = useState("dr_a");
  const [doctorVideos, setDoctorVideos] = useState<DoctorVideo[]>(() => getAllDoctorVideos("dr_a"));
  const [videoCondition, setVideoCondition] = useState("entorse-cheville");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoSource, setVideoSource] = useState("");
  const [videoNotice, setVideoNotice] = useState("");
  const [pathway, setPathway] = useState("entorse-cheville");
  const [cardNote, setCardNote] = useState("");
  const pathwayLabels: Record<string, string> = {
    "entorse-cheville": "Entorse de la cheville",
    "douleur-lombaire": "Douleur lombaire",
    "post-operatoire": "Suivi post-opératoire",
  };

  // Affiche salle d'attente → ouvre le questionnaire de pré-consultation.
  useEffect(() => {
    const target = `${window.location.origin}/orientation?src=affiche`;
    setPoster((prev) => ({ ...prev, url: target }));
    let cancelled = false;
    void import("qrcode").then(async (mod) => {
      const dataUrl = await mod.default.toDataURL(target, { width: 640, margin: 1, errorCorrectionLevel: "H" });
      if (cancelled) return;
      setPoster((prev) => ({ ...prev, qr: dataUrl }));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Carte remise au patient → ouvre le parcours attribué (étapes, conseils, vidéos, professionnels).
  useEffect(() => {
    const cardTarget = `${window.location.origin}/parcours?pathway=${pathway}&src=carte`;
    setCardQr({ url: cardTarget, qr: null });
    let cancelled = false;
    void import("qrcode").then(async (mod) => {
      const cardUrl = await mod.default.toDataURL(cardTarget, { width: 480, margin: 1, errorCorrectionLevel: "H" });
      if (cancelled) return;
      setCardQr({ url: cardTarget, qr: cardUrl });
    });
    return () => {
      cancelled = true;
    };
  }, [pathway]);

  const updatePoster = (patch: Partial<PosterData>) => setPoster((prev) => ({ ...prev, ...patch }));

  const switchVideoCabinet = (cabinetId: string) => {
    setVideoCabinet(cabinetId);
    setDoctorVideos(getAllDoctorVideos(cabinetId));
  };

  const addDoctorVideo = () => {
    const title = videoTitle.trim();
    const url = videoUrl.trim();
    if (!title || !url || !/^https:\/\//i.test(url)) {
      setVideoNotice("Ajoutez un titre et une URL HTTPS valide.");
      return;
    }
    const video: DoctorVideo = {
      id: `${videoCabinet}-${Date.now()}`,
      conditionId: videoCondition,
      label: title,
      url,
      kind: "video",
      source: videoSource.trim() || "Lien choisi par le médecin",
      active: true,
    };
    saveDoctorVideo(videoCabinet, video);
    setDoctorVideos(getAllDoctorVideos(videoCabinet));
    setVideoTitle("");
    setVideoUrl("");
    setVideoSource("");
    setVideoNotice("Vidéo ajoutée : elle sera proposée au patient pour ce trouble.");
  };

  const deleteDoctorVideo = (videoId: string) => {
    removeDoctorVideo(videoCabinet, videoId);
    setDoctorVideos(getAllDoctorVideos(videoCabinet));
  };

  const printWith = (mode: "poster" | "cards") => {
    document.body.classList.toggle("printing-cards", mode === "cards");
    window.print();
    window.setTimeout(() => document.body.classList.remove("printing-cards"), 500);
  };


  return (
    <main className="mx-auto max-w-5xl px-4 py-10 print:py-0">
      {/* Hero */}
      <section className="text-center print:hidden">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-care/20 bg-care/5 px-3 py-1 text-xs font-medium text-care">
          <Stethoscope className="h-3.5 w-3.5" />
          Pour les professionnels de santé
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Le parcours continue après la consultation
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Kivoir vous aide à donner au patient une feuille de route claire : ce qui a été fait, ce qui vient ensuite et ce qu’il doit préparer. Un support simple avant et après votre échange.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-8 print:hidden" aria-labelledby="questionnaire-title">
        <div className="flex items-start gap-3"><ClipboardCheck className="mt-1 text-care" aria-hidden="true" /><div><p className="text-xs font-semibold uppercase tracking-wide text-care">Questionnaire en salle d’attente</p><h2 id="questionnaire-title" className="mt-2 text-2xl font-semibold text-foreground">Ce que le médecin retrouve avant la consultation</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Le patient décrit ce qu’il ressent. Kivoir rassemble ces réponses dans une synthèse structurée ; le médecin les complète par son examen clinique et sa décision médicale.</p></div></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-background p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Intensité</p><p className="mt-2 font-semibold text-foreground">0 à 10</p><p className="mt-1 text-sm text-muted-foreground">Niveau de douleur déclaré.</p></div><div className="rounded-2xl bg-background p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Durée</p><p className="mt-2 font-semibold text-foreground">Depuis quand ?</p><p className="mt-1 text-sm text-muted-foreground">Début, évolution et fréquence.</p></div><div className="rounded-2xl bg-background p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qualité</p><p className="mt-2 font-semibold text-foreground">Comment ?</p><p className="mt-1 text-sm text-muted-foreground">Contexte, localisation et gêne.</p></div></div>
        <div className="mt-5 rounded-2xl border border-care/20 bg-care/5 p-4 text-sm leading-6 text-muted-foreground"><span className="font-semibold text-foreground">Après lecture :</span> le professionnel confirme le diagnostic ou la situation, décide des examens et orientations nécessaires, puis attribue le parcours adapté.</div>
      </section>

      <section className="mt-8 rounded-3xl border border-care/25 bg-care/5 p-6 md:p-8 print:hidden" aria-labelledby="pathway-choice-title">
        <p className="text-xs font-semibold uppercase tracking-wide text-care">Attribution professionnelle</p>
        <h2 id="pathway-choice-title" className="mt-2 text-2xl font-semibold text-foreground">C’est vous qui attribuez le parcours</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Le patient ne choisit pas sa pathologie. Après la consultation, vous confirmez le diagnostic ou la situation, puis vous choisissez le parcours directement sur la carte remise au patient (plus bas).</p>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">Kivoir n’interprète pas les symptômes et ne pose pas le diagnostic. Le professionnel reste responsable de la confirmation.</p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2 print:hidden" aria-label="Parcours du cabinet">
        <WorkflowCard icon={QrCode} step="1" title="Avant la consultation" text="Le patient repère son étape, prépare ses questions et rassemble ses documents." />
        <WorkflowCard icon={Users} step="2" title="Après la consultation" text="Vous lui remettez une feuille de route : prochaine étape, consigne et éléments à préparer." />
      </section>

      {/* Why propose Kivoir */}
      <section className="mt-10 rounded-2xl border border-care/20 bg-care/5 p-6 md:p-8 print:hidden">
        <h2 className="text-xl font-semibold text-foreground">Pourquoi proposer Kivoir au patient</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Kivoir n'est pas prescrit : il est mis à disposition du patient comme un support d'information et de préparation
          à la consultation. Le médecin garde le libre choix de le proposer ou non, sans que cela soit un acte médical.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-care">Avant la consultation</p>
            <p className="mt-1 text-sm font-medium text-foreground">L'affiche QR en salle d'attente</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Le patient arrive avec son étape actuelle, ses questions et les documents utiles à l’échange.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-care">Après la consultation</p>
            <p className="mt-1 text-sm font-medium text-foreground">La carte remise au patient</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Il retrouve chez lui la feuille de route, la prochaine étape et vos consignes, sans vous solliciter à nouveau pour chaque détail.
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-3">
          <li className="flex items-start gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-care" />
            Le patient arrive avec un parcours lisible : étape actuelle, démarches déjà réalisées, questions et documents disponibles.
          </li>
          <li className="flex items-start gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-care" />
            Il retrouve une feuille de route claire et peut préparer son prochain échange avec les bonnes informations.
          </li>
          <li className="flex items-start gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-care" />
            Le médecin peut se concentrer sur l'examen clinique et la décision médicale, sans temps perdu en répétitions.
          </li>
        </ul>
      </section>

      {/* Value props */}
      <section className="mt-12 grid gap-6 sm:grid-cols-3 print:hidden">
        <ValueCard
          icon={Clock}
          title="Moins de répétitions"
          text="Le patient arrive avec son étape actuelle, ses questions et les éléments utiles à l’échange."
        />
        <ValueCard
          icon={ShieldCheck}
          title="Une suite plus claire"
          text="Vous expliquez la prochaine étape ; le patient peut la retrouver ensuite sans solliciter le cabinet pour chaque détail."
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
title="Le patient prépare"
                text="En salle d'attente, le patient repère son étape, ses questions et les documents utiles sur son téléphone."
          />
          <StepCard
            number={3}
            icon={ClipboardCheck}
title="Vous validez la feuille"
  text="En consultation, vous confirmez l’étape actuelle, la prochaine étape et les consignes à retrouver après l’échange."
          />
        </div>
      </section>

      {/* Poster editor */}
      <section className="mt-16 poster-section">
        <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Brique 1 — Affiche questionnaire</h2>
            <p className="mt-1 text-muted-foreground">
              Le QR code ouvre le questionnaire de pré-consultation. Personnalisez le texte, puis imprimez ou affichez sur un écran en salle d’attente.
            </p>
          </div>
          <button
            onClick={() => printWith("poster")}
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
Placez l'affiche près des sièges de la salle d'attente. Le patient scanne et remplit le questionnaire
              avant d’entrer en consultation.
              </p>
            </div>
          </div>

          <div className="flex items-start justify-center">
            <CabinetPoster data={poster} />
          </div>
        </div>
      </section>

      {/* Patient pocket cards */}
      <section className="mt-16 card-section">
        <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Brique 2 — Carte patient</h2>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              À la fin de la consultation, remettez cette carte : le patient retrouve son parcours, des conseils et vidéos adaptés, et la suite de sa prise en charge.
            </p>
          </div>
          <button
            onClick={() => printWith("cards")}
            className="inline-flex items-center gap-2 rounded-lg border border-care bg-card px-4 py-2 text-sm font-medium text-care transition-colors hover:bg-care/10 print:hidden"
          >
            <Printer className="h-4 w-4" />
            Imprimer 8 cartes
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 print:hidden">
            <div>
              <label htmlFor="cardPathway" className="block text-sm font-medium text-foreground">
                Parcours ouvert par la carte
              </label>
              <select
                id="cardPathway"
                value={pathway}
                onChange={(e) => setPathway(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(pathwayLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">La carte ouvre ce parcours : étapes, conseils, vidéos et professionnels à consulter.</p>
            </div>
            <div>
              <label htmlFor="cardNote" className="block text-sm font-medium text-foreground">
                Consigne personnalisée (optionnel)
              </label>
              <textarea
                id="cardNote"
                rows={2}
                value={cardNote}
                maxLength={90}
                onChange={(e) => setCardNote(e.target.value)}
                placeholder="Ex : Contrôle dans 3 semaines si la gêne persiste."
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">Un mot manuscrit ou imprimé qui apparaît directement sur la carte.</p>
            </div>
          </div>

          <div className="flex items-start justify-center">
            <PatientCard data={{ ...cardQr, cabinetName: poster.cabinetName, doctorName: poster.doctorName, pathwayLabel: pathwayLabels[pathway], note: cardNote }} />
          </div>
        </div>

        {/* Feuille d'impression : 8 cartes à découper */}
        <div className="card-sheet hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <PatientCard
              key={i}
              data={{ ...cardQr, cabinetName: poster.cabinetName, doctorName: poster.doctorName, pathwayLabel: pathwayLabels[pathway], note: cardNote }}
            />
          ))}
        </div>
      </section>



      <section className="mt-16 rounded-3xl border border-care/25 bg-care/5 p-6 md:p-8 print:hidden" aria-labelledby="doctor-content-title">
        <div className="flex items-start gap-3">
          <Video className="mt-1 text-care" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-care">Espace médecin</p>
            <h2 id="doctor-content-title" className="mt-2 text-2xl font-semibold text-foreground">Choisissez ce que le patient peut voir</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Ajoutez vos propres vidéos d’information par trouble. Elles seront proposées par l’Assistant Kivoir uniquement lorsque le patient demande un conseil ou une explication.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <label className="block text-sm font-medium text-foreground" htmlFor="video-cabinet">Réseau concerné</label>
            <select id="video-cabinet" value={videoCabinet} onChange={(event) => switchVideoCabinet(event.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
              <option value="dr_a">Réseau du Dr A</option>
              <option value="dr_b">Réseau du Dr B</option>
            </select>
            <label className="block text-sm font-medium text-foreground" htmlFor="video-condition">Trouble ou parcours</label>
            <select id="video-condition" value={videoCondition} onChange={(event) => setVideoCondition(event.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
              {conditions.map((condition) => <option key={condition.id} value={condition.id}>{condition.name}</option>)}
            </select>
            <label className="block text-sm font-medium text-foreground" htmlFor="video-title">Titre de la vidéo</label>
            <input id="video-title" value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} placeholder="Ex. Les bons gestes après une entorse" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground" />
            <label className="block text-sm font-medium text-foreground" htmlFor="video-url">Lien HTTPS</label>
            <input id="video-url" type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://..." className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground" />
            <label className="block text-sm font-medium text-foreground" htmlFor="video-source">Source (optionnel)</label>
            <input id="video-source" value={videoSource} onChange={(event) => setVideoSource(event.target.value)} placeholder="Ex. Cabinet du Dr A" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground" />
            <button type="button" onClick={addDoctorVideo} className="inline-flex items-center gap-2 rounded-lg bg-care px-4 py-2 text-sm font-semibold text-care-foreground hover:opacity-90"><Plus className="h-4 w-4" />Ajouter cette vidéo</button>
            {videoNotice ? <p className="text-xs leading-5 text-muted-foreground" role="status">{videoNotice}</p> : null}
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-care">Visible par le patient</p><h3 className="mt-1 text-lg font-semibold text-foreground">Vidéos personnalisées</h3></div><span className="rounded-full bg-care/10 px-2 py-1 text-xs font-medium text-care">{doctorVideos.length}</span></div>
            <div className="mt-4 flex flex-col gap-3">
              {doctorVideos.length === 0 ? <p className="rounded-xl border border-dashed border-border p-4 text-sm leading-6 text-muted-foreground">Aucune vidéo personnalisée. Les ressources générales de Kivoir restent utilisées.</p> : doctorVideos.map((video) => <article key={video.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-3"><div><p className="font-semibold text-foreground">{video.label}</p><p className="mt-1 text-xs text-care">{conditions.find((condition) => condition.id === video.conditionId)?.name ?? video.conditionId}</p><p className="mt-1 text-xs text-muted-foreground">{video.source}</p></div><button type="button" onClick={() => deleteDoctorVideo(video.id)} aria-label={`Supprimer ${video.label}`} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></article>)}
            </div>
          </div>
        </div>
      </section>

      {/* Demo summary */}
      <section className="mt-16 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Exemple de feuille de route</h2>
            <p className="mt-1 text-muted-foreground">Voici ce que le patient retrouve après votre validation.</p>
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
          <div className="mt-6 rounded-3xl border border-care/20 bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-care">Feuille validée</p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">Après la consultation</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-background p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Étape actuelle</p><p className="mt-2 font-semibold text-foreground">Consultation réalisée</p></div>
              <div className="rounded-2xl bg-care/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-care">Prochaine étape</p><p className="mt-2 font-semibold text-foreground">Rassembler les documents utiles</p></div>
              <div className="rounded-2xl bg-background p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">À préparer</p><p className="mt-2 font-semibold text-foreground">Questions pour le prochain échange</p></div>
            </div>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">Le patient retrouve cette feuille via le QR code. Vous confirmez les éléments et ajoutez vos consignes avant de la lui remettre.</p>
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
            answer="Non. Ils scannent le QR code et retrouvent directement le parcours partagé."
          />
          <FaqCard
            question="Où vont les données ?"
            answer="Nulle part. Les réponses restent dans le navigateur du patient et disparaissent quand il ferme l'onglet."
          />
          <FaqCard
            question="Comment le médecin récupère-t-il la synthèse ?"
            answer="À la fin du questionnaire, un QR code s'affiche. Vous le scannez depuis votre poste : le texte structuré s'ouvre, prêt à copier-coller dans votre compte rendu."
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

function WorkflowCard({ icon: Icon, step, title, text }: { icon: React.ElementType; step: string; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-care/20 bg-card p-5 shadow-sm">
      <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-care/10 text-care">
        <Icon aria-hidden="true" />
        <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-care text-xs font-semibold text-primary-foreground">{step}</span>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-care">Brique cabinet</p>
        <h2 className="mt-1 text-lg font-semibold text-card-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
      </div>
    </div>
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
