import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
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
  const [cardQr, setCardQr] = useState<{ url: string; qr: string | null }>({ url: "", qr: null });

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

  // Carte remise au patient → ouvre le parcours attribué (étapes, conseils, vidéos, professionnels).
  useEffect(() => {
    const cardTarget = `${window.location.origin}/?pathway=${pathway}&src=carte`;
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
      {/* Hero + tableau de bord */}
      <section className="print:hidden">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-care/20 bg-care/5 px-3 py-1 text-xs font-medium text-care">
          <Stethoscope className="h-3.5 w-3.5" />
          Espace médecin
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl text-balance">
          Que souhaitez-vous faire&nbsp;?
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground text-pretty">
          Trois accès rapides pour accompagner votre patient, sans créer de dossier ni saisir de données de santé.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => document.getElementById("patient-card")?.scrollIntoView({ behavior: "smooth" })}
            className="group flex flex-col rounded-3xl border border-care/20 bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-care/40 hover:shadow-lg hover:shadow-care/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-care/10 text-care ring-1 ring-care/15">
              <QrCode className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-care">1 · Première visite</p>
            <h2 className="mt-1.5 text-xl font-semibold text-foreground">Nouveau patient</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Affichez le QR code ou partagez le lien du Compagnon Patient.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Ouvrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </button>

          <button
            type="button"
            onClick={() => document.getElementById("follow-up")?.scrollIntoView({ behavior: "smooth" })}
            className="group flex flex-col rounded-3xl border border-care/20 bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-care/40 hover:shadow-lg hover:shadow-care/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-care/10 text-care ring-1 ring-care/15">
              <Video className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-care">2 · Visite de suivi</p>
            <h2 className="mt-1.5 text-xl font-semibold text-foreground">Post-examen</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Choisissez une vidéo ou une ressource validée à partager au patient.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Ouvrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </button>

          <Link
            to="/annuaire"
            className="group flex flex-col rounded-3xl border border-care/20 bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-care/40 hover:shadow-lg hover:shadow-care/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-care/10 text-care ring-1 ring-care/15">
              <Users className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-care">3 · Orientation</p>
            <h2 className="mt-1.5 text-xl font-semibold text-foreground">Annuaire du réseau CPTS</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Trouvez le professionnel partenaire adapté au territoire.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Ouvrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </Link>
        </div>

        <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-care" aria-hidden="true" />
          Kivoir sert à orienter et partager des ressources validées : aucune donnée de santé n’est enregistrée ici.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-care/25 bg-care/5 p-6 md:p-8 print:hidden" aria-labelledby="pathway-choice-title">
        <p className="text-xs font-semibold uppercase tracking-wide text-care">Attribution professionnelle</p>
        <h2 id="pathway-choice-title" className="mt-2 text-2xl font-semibold text-foreground">C’est vous qui attribuez le parcours</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Le patient ne choisit pas sa pathologie. Après la consultation, vous confirmez le diagnostic ou la situation, puis vous choisissez le parcours directement sur la carte remise au patient (plus bas).</p>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">Kivoir n’interprète pas les symptômes et ne pose pas le diagnostic. Le professionnel reste responsable de la confirmation.</p>
      </section>


      {/* Patient pocket cards */}
      <section id="patient-card" className="mt-16 card-section">
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
            <PatientCard data={{ ...cardQr, cabinetName: "Cabinet médical", doctorName: "", pathwayLabel: pathwayLabels[pathway], note: cardNote }} />
          </div>
        </div>

        {/* Feuille d'impression : 8 cartes à découper */}
        <div className="card-sheet hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <PatientCard
              key={i}
              data={{ ...cardQr, cabinetName: "Cabinet médical", doctorName: "", pathwayLabel: pathwayLabels[pathway], note: cardNote }}
            />
          ))}
        </div>
      </section>



      <section id="follow-up" className="mt-16 rounded-3xl border border-care/25 bg-care/5 p-6 md:p-8 print:hidden" aria-labelledby="doctor-content-title">
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
            question="Le patient doit-il créer un compte ?"
            answer="Non. Il scanne la carte QR et accède directement à son espace patient."
          />
          <FaqCard
            question="Que peut-il retrouver dans son espace ?"
            answer="L’Assistant Kivoir, les conseils et vidéos sélectionnés, ainsi que l’annuaire des professionnels partenaires."
          />
          <FaqCard
            question="Puis-je adapter l’accompagnement ?"
            answer="Oui. Choisissez la pathologie de la carte QR et ajoutez les ressources vidéo utiles à ce parcours."
          />
          <FaqCard
            question="Kivoir remplace-t-il le suivi médical ?"
            answer="Non. Kivoir informe et oriente ; le diagnostic, les décisions et le suivi restent du ressort du professionnel de santé."
          />
        </div>
      </section>

      <div className="mt-10 print:hidden">
        <MedicalDisclaimer />
      </div>
    </main>
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
