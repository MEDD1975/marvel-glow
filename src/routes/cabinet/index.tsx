import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { put as putBlob } from "@vercel/blob/client";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  HelpCircle,
  Printer,
  ShieldCheck,
  Stethoscope,
  Users,
  FileText,
  Video,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { conditions } from "@/lib/conditions";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";
import { PatientCard } from "@/components/PatientCard";
import { DoctorOnboarding } from "@/components/DoctorOnboarding";


export const Route = createFileRoute("/cabinet/")({
  head: () => ({
    meta: [
      { title: "Espace cabinet — Kivoir" },
      {
        name: "description",
        content:
          "Créez une carte QR patient et partagez des ressources validées, sans stocker de données de santé.",
      },
      { property: "og:title", content: "Espace cabinet — Kivoir" },
      {
        property: "og:description",
        content:
          "Un espace professionnel pour remettre la bonne carte QR et orienter vers les bonnes ressources.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CabinetPage,
});

function CabinetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session, isPending } = authClient.useSession();
  const [cardQr, setCardQr] = useState<{ url: string; qr: string | null }>({ url: "", qr: null });
  const [showNetworkConfig, setShowNetworkConfig] = useState(false);
  const [showResourceConfig, setShowResourceConfig] = useState(false);

  useEffect(() => {
    const view = (location.search as { view?: string }).view;
    setShowNetworkConfig(view === "network");
    setShowResourceConfig(view === "resources");
  }, [location.search]);

  const doctorNetworkId = session?.user.id ?? "doctor";
  const [doctorVideos, setDoctorVideos] = useState<DoctorResourceRecord[]>([]);

  useEffect(() => {
    if (!session?.user) return;
    void fetch("/api/doctor-resources").then(async (response) => {
      if (!response.ok) throw new Error("Impossible de charger les fichiers");
      return response.json() as Promise<DoctorResourceRecord[]>;
    }).then(setDoctorVideos).catch(() => notifyError("Impossible de charger vos fichiers enregistrés."));
  }, [session?.user]);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoSource, setVideoSource] = useState("");
  const [videoNotice, setVideoNotice] = useState("");
  const [videoNoticeType, setVideoNoticeType] = useState<"error" | "success" | "">("");
  const [isUploading, setIsUploading] = useState(false);
  const notifyError = (message: string) => { setVideoNoticeType("error"); setVideoNotice(message); };
  const notifySuccess = (message: string) => { setVideoNoticeType("success"); setVideoNotice(message); };
  const [pathway, setPathway] = useState("entorse-cheville");
  const [cardNote, setCardNote] = useState("");
  const pathwayLabel = conditions.find((condition) => condition.id === pathway)?.name ?? "";
  const conditionVideos = doctorVideos.filter((video) => video.conditionId === pathway);

  // Carte remise au patient → ouvre le parcours attribué (étapes, conseils, vidéos, professionnels).
  useEffect(() => {
    const noteParam = cardNote.trim() ? `&note=${encodeURIComponent(cardNote.trim())}` : "";
    const cardTarget = `${window.location.origin}/conseils?c=${encodeURIComponent(pathway)}${noteParam}`;
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
  }, [cardNote, pathway]);

  const addDoctorVideo = async () => {
    if (!selectedFile && !videoUrl.trim()) {
      notifyError("Sélectionnez un fichier ou saisissez un lien HTTPS.");
      return;
    }
    const title = videoTitle.trim();
    if (!title) {
      notifyError("Saisissez un titre pour que le patient identifie facilement ce contenu.");
      return;
    }
    setVideoNotice("");
    setVideoNoticeType("");
    setIsUploading(true);
    try {
      const url = videoUrl.trim();
      if (selectedFile) {
        const tokenResponse = await fetch("/api/doctor-file-token", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ filename: selectedFile.name, contentType: selectedFile.type }),
        });
        const tokenResult = await tokenResponse.json() as { token?: string; pathname?: string; error?: string };
        if (!tokenResponse.ok || !tokenResult.token || !tokenResult.pathname) {
          setIsUploading(false);
          notifyError(tokenResult.error ?? "Impossible de préparer l’enregistrement du fichier.");
          return;
        }
        const blob = await putBlob(tokenResult.pathname, selectedFile, {
          access: "public",
          token: tokenResult.token,
          multipart: true,
          contentType: selectedFile.type || undefined,
        });
        const metadataResponse = await fetch("/api/doctor-resources", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title, conditionId: pathway, url: blob.url, filename: selectedFile.name, contentType: selectedFile.type || "application/octet-stream", source: videoSource.trim() || "Fichier partagé par le médecin" }),
        });
        const result = await metadataResponse.json() as DoctorResourceRecord & { error?: string };
        if (!metadataResponse.ok || !result.id) {
          setIsUploading(false);
          notifyError(result.error ?? "Le fichier est chargé mais n’a pas pu être enregistré.");
          return;
        }
        setDoctorVideos((current) => [result, ...current]);
        setVideoTitle("");
        setVideoUrl("");
        setSelectedFile(null);
        setVideoSource("");
        setIsUploading(false);
        notifySuccess("Fichier ajouté : il apparaît maintenant dans la bibliothèque de conseils du patient.");
        return;
      }

      if (!/^https:\/\//i.test(url)) {
        setIsUploading(false);
        notifyError("Le lien doit commencer par https://.");
        return;
      }
      const response = await fetch("/api/doctor-resources", {
        method: "POST",
        headers: { "content-type": "application/json" },
          body: JSON.stringify({ title, conditionId: pathway, url, filename: undefined, contentType: "video/*", source: videoSource.trim() || "Fichier partagé par le médecin" }),
      });
      const savedResult = await response.json() as DoctorResourceRecord & { error?: string };
      if (!response.ok || !savedResult.id) {
        setIsUploading(false);
        notifyError(savedResult.error ?? "Impossible d’enregistrer ce fichier dans votre bibliothèque.");
        return;
      }
      setDoctorVideos((current) => [savedResult, ...current]);
      setVideoTitle("");
      setVideoUrl("");
      setSelectedFile(null);
      setVideoSource("");
      setIsUploading(false);
      notifySuccess("Lien ajouté : il apparaît maintenant dans la bibliothèque de conseils du patient.");
    } catch (error) {
      console.error("[v0] doctor resource upload failed", error);
      setIsUploading(false);
      notifyError(error instanceof DOMException && error.name === "AbortError" ? "L����enregistrement prend trop de temps. Vérifiez votre connexion ou utilisez un lien HTTPS vers la vidéo." : "L’enregistrement a échoué. Vérifiez votre connexion et réessayez.");
    }
  };

  const deleteDoctorVideo = async (resourceId: string) => {
    const response = await fetch("/api/doctor-resources", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: resourceId }) });
    if (response.ok) setDoctorVideos((current) => current.filter((resource) => resource.id !== resourceId));
    else notifyError("La suppression a échoué. Réessayez.");
  };

  const printWith = (mode: "poster" | "cards") => {
    document.body.classList.toggle("printing-cards", mode === "cards");
    window.print();
    window.setTimeout(() => document.body.classList.remove("printing-cards"), 500);
  };

  const downloadPatientQr = async () => {
    if (!cardQr.qr) return;
    try {
      const response = await fetch(cardQr.qr);
      const blob = await response.blob();
      const file = new File([blob], "kivoir-qr-code.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "QR code Kivoir" });
        return;
      }
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "kivoir-qr-code.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("[v0] QR code download failed", error);
    }
  };

  const exportPatientQrPdf = async () => {
    if (!cardQr.qr) return;
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    pdf.setTextColor(16, 35, 72);
    pdf.setFontSize(18);
    pdf.text("Kivoir — Parcours patient", 20, 24);
    pdf.setTextColor(60, 72, 90);
    pdf.setFontSize(11);
    pdf.text("Scannez ce QR code pour accéder au parcours patient.", 20, 34);
    pdf.addImage(cardQr.qr, "PNG", 20, 48, 82, 82);
    pdf.setFontSize(10);
    pdf.text("Lien :", 20, 144);
    pdf.text(pdf.splitTextToSize(cardQr.url, 165), 20, 151);
    pdf.save("kivoir-parcours-patient.pdf");
  };


  if (isPending || !session?.user) {
    return <main className="mx-auto max-w-3xl px-4 py-16"><p className="text-center text-sm text-muted-foreground">Vérification de votre session…</p></main>;
  }

  return (
    <main className={`mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 print:py-0 ${showResourceConfig ? "flex flex-col" : ""}`}>
      {/* Hero + tableau de bord */}
      <section className={showNetworkConfig || showResourceConfig ? "hidden" : "print:hidden"}>
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
            onClick={() => {
              setShowResourceConfig(false);
              setShowNetworkConfig(true);
              requestAnimationFrame(() => {
                const section = document.getElementById("onboarding-title");
                if (!section) return;
                const top = section.getBoundingClientRect().top + window.scrollY - 128;
                window.scrollTo({ top, behavior: "smooth" });
              });
            }}
            className="group flex flex-col rounded-3xl border border-care/20 bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-care/40 hover:shadow-lg hover:shadow-care/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-care/10 text-care ring-1 ring-care/15">
              <Users className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-care">1 · Réseau professionnel</p>
            <h2 className="mt-1.5 text-xl font-semibold text-foreground">Gérer mon réseau professionnel</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Ajoutez et mettez à jour les professionnels que vos patients pourront retrouver.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Ouvrir <span className="sr-only">la gestion du réseau professionnel</span> <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowNetworkConfig(false);
              setShowResourceConfig(true);
              requestAnimationFrame(() => {
                const section = document.getElementById("follow-up");
                if (!section) return;
                const top = section.getBoundingClientRect().top + window.scrollY - 96;
                window.scrollTo({ top, behavior: "smooth" });
              });
            }}
            className="group flex flex-col rounded-3xl border border-care/20 bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-care/40 hover:shadow-lg hover:shadow-care/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-care/10 text-care ring-1 ring-care/15">
              <Video className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-care">2 · Bibliothèque de contenus</p>
            <h2 className="mt-1.5 text-xl font-semibold text-foreground">Partager des contenus médicaux</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Choisissez des vidéos ou des ressources validées à partager au patient.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Ouvrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </button>

          <button
            type="button"
            onClick={async () => {
              const response = await fetch("/api/doctor-network");
              if (!response.ok) return;
              const network = await response.json() as { id?: string };
              if (network.id) {
                await navigate({ to: "/annuaire", search: { cabinet: network.id } });
              }
            }}
            className="group flex flex-col rounded-3xl border border-care/20 bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-care/40 hover:shadow-lg hover:shadow-care/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-care/10 text-care ring-1 ring-care/15">
              <Users className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-care">3 · Aperçu patient</p>
            <h2 className="mt-1.5 text-xl font-semibold text-foreground">Prévisualisez mon réseau</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Vérifiez la page publique telle que vos patients la voient.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Prévisualisez mon réseau <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </button>
        </div>

      </section>

      {showNetworkConfig || showResourceConfig ? (
        <button
          type="button"
          onClick={() => {
            setShowNetworkConfig(false);
            setShowResourceConfig(false);
          }}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {showResourceConfig ? "Retour à mon espace médecin" : "Retour à mon espace médecin"}
        </button>
      ) : null}

      <div style={{ display: showNetworkConfig ? undefined : "none" }}>
        <DoctorOnboarding />
      </div>

      {showResourceConfig ? <>
        {/* Patient pocket cards */}
        <section id="patient-card" className={`${showNetworkConfig ? "hidden" : ""} ${showResourceConfig ? "order-2" : ""} mt-12 card-section`}>
        <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">QR code du parcours patient</h2>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              Imprimez ou enregistrez le QR code pour le transmettre au patient par le canal de votre choix. Sur iPad ou iPhone, ouvrez-le puis faites un appui long sur l’image pour l’enregistrer dans Photos ou Fichiers. Sur PC et Mac, le fichier est téléchargé automatiquement.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              onClick={() => printWith("cards")}
              className="inline-flex items-center gap-2 rounded-lg border border-care bg-card px-4 py-2 text-sm font-medium text-care transition-colors hover:bg-care/10"
            >
              <Printer className="h-4 w-4" />
              Imprimer le QR code
            </button>
            <button
              onClick={() => void exportPatientQrPdf()}
              disabled={!cardQr.qr}
              className="inline-flex items-center gap-2 rounded-lg border border-care bg-card px-4 py-2 text-sm font-medium text-care transition-colors hover:bg-care/10 disabled:cursor-wait disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Exporter en PDF
            </button>
            {cardQr.qr ? (
              <button
                type="button"
                onClick={() => void downloadPatientQr()}
                disabled={!cardQr.qr}
                className="inline-flex items-center gap-2 rounded-lg bg-care px-4 py-2 text-sm font-medium text-care-foreground transition-colors hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Partager / enregistrer le QR code
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 print:hidden">
            <div>
              <p className="text-sm font-medium text-foreground">Parcours ouvert par la carte</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">La carte ouvrira automatiquement le suivi du trouble ou parcours choisi.</p>
              <label htmlFor="card-pathway-default" className="mt-3 block text-xs font-semibold uppercase tracking-wide text-care">Choix du parcours</label>
              <select id="card-pathway-default" value={pathway} disabled aria-describedby="card-pathway-default-hint" className="mt-1 w-full cursor-not-allowed rounded-lg border border-input bg-muted px-3 py-2 text-sm font-medium text-foreground opacity-90">
                {conditions.map((condition) => <option key={condition.id} value={condition.id}>{condition.name}</option>)}
              </select>
              <p id="card-pathway-default-hint" className="mt-1 text-xs text-muted-foreground">Ce choix est défini dans « Trouble ou parcours » ci-dessus.</p>
            </div>
            <div>
              <label htmlFor="cardNote" className="block text-sm font-medium text-foreground">
                Consigne personnalisée (optionnel)
              </label>
              <textarea
                id="cardNote"
  rows={4}
> value={cardNote}
  maxLength={180}
                onChange={(e) => setCardNote(e.target.value)}
                placeholder="Ex : Contrôle dans 3 semaines si la gêne persiste."
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">Un mot manuscrit ou imprimé qui apparaît directement sur la carte.</p>
            </div>
          </div>

          <div className="card-preview print:hidden flex items-start justify-center">
            <PatientCard data={{ ...cardQr, cabinetName: "Cabinet médical", doctorName: "", pathwayLabel, note: cardNote }} />
          </div>
        </div>

        {/* Version imprimée : une seule carte */}
        <div className="card-sheet hidden print:flex">
          <PatientCard
            data={{ ...cardQr, cabinetName: "Cabinet médical", doctorName: "", pathwayLabel, note: cardNote }}
          />
        </div>
      </section>



      <section id="follow-up" style={{ display: showNetworkConfig ? "none" : undefined }} className={`${showResourceConfig ? "order-1" : ""} mt-16 rounded-3xl border border-care/25 bg-care/5 p-6 md:p-8 print:hidden`} aria-labelledby="doctor-content-title">
        <div className="flex items-start gap-3">
          <FileText className="mt-1 text-care" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-care">Bibliothèque de fichiers</p>
            <h2 id="doctor-content-title" className="mt-2 text-2xl font-semibold text-foreground">Créer le contenu destiné au patient</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Ajoutez les vidéos ou documents d’information que votre patient pourra retrouver après la consultation, dans sa bibliothèque de conseils.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <label className="block text-sm font-medium text-foreground" htmlFor="video-condition">Trouble ou parcours</label>
            <select id="video-condition" value={pathway} onChange={(event) => { setPathway(event.target.value); setCardNote(""); }} aria-describedby="video-condition-hint" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
              {conditions.map((condition) => <option key={condition.id} value={condition.id}>{condition.name}</option>)}
            </select>
            <p id="video-condition-hint" className="text-xs text-muted-foreground">Ce choix définit automatiquement le parcours ouvert par la carte patient.</p>
<label className="block text-sm font-medium text-foreground" htmlFor="video-title">Titre du contenu médical <span className="font-normal text-muted-foreground">(obligatoire)</span></label>
  <input id="video-title" required value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} placeholder="Ex. Les bons gestes après une entorse" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground" />
  <p className="text-xs text-muted-foreground">Ce titre sera affiché au patient à la place de « Ressource partagée ».</p>
            <label className="block text-sm font-medium text-foreground" htmlFor="doctor-file">Fichier à partager</label>
            <input
              id="doctor-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp,.mp4,.mov,.m4v,image/*,video/*,application/pdf"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
                if (file && !videoTitle.trim()) {
                  setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
                }
              }}
              className="sr-only"
            />
            <label
              htmlFor="doctor-file"
              className="inline-flex cursor-pointer items-center rounded-lg bg-care/10 px-3 py-2 text-sm font-semibold text-care transition-colors hover:bg-care/15 focus-within:ring-2 focus-within:ring-ring"
            >
              Choisir le fichier
            </label>
            <p className="text-xs text-muted-foreground">PDF, JPG, PNG, HEIC, WEBP, MP4 ou MOV — 50 Mo maximum.</p>
            {selectedFile ? <div className="rounded-xl border border-care/30 bg-care/5 p-3" aria-live="polite">
              <p className="text-xs font-semibold uppercase tracking-wide text-care">Fichier sélectionné</p>
              <div className="mt-2 flex items-center gap-3">
                {selectedFile.type.startsWith("image/") ? <img src={URL.createObjectURL(selectedFile)} alt="Aperçu du fichier sélectionné" className="h-16 w-16 rounded-lg object-cover" /> : <FileText className="h-8 w-8 shrink-0 text-care" aria-hidden="true" />}
                <p className="min-w-0 truncate text-sm font-medium text-foreground">{selectedFile.name}</p>
              </div>
            </div> : null}
            <label className="block text-sm font-medium text-foreground" htmlFor="video-url">Ou lien HTTPS</label>
            <input id="video-url" type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://..." className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground" />
            <label className="block text-sm font-medium text-foreground" htmlFor="video-source">Source (optionnel)</label>
            <input id="video-source" value={videoSource} onChange={(event) => setVideoSource(event.target.value)} placeholder="Ex. Cabinet du Dr A" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground" />
            {videoNotice ? <p className={`rounded-lg px-3 py-2 text-sm leading-5 ${videoNoticeType === "error" ? "bg-destructive/10 text-destructive" : videoNoticeType === "success" ? "bg-care/10 text-care" : "text-muted-foreground"}`} role={videoNoticeType === "error" ? "alert" : "status"}>{videoNotice}</p> : null}
            <button type="button" onClick={() => void addDoctorVideo()} disabled={isUploading || !videoTitle.trim() || (!selectedFile && !videoUrl.trim())} className="inline-flex w-full items-center justify-center rounded-lg bg-care px-4 py-2.5 text-sm font-semibold text-care-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">{isUploading ? "Ajout en cours…" : "Ajouter à l’espace patient"}</button>
            <p className="text-center text-xs text-muted-foreground">La ressource apparaîtra aussitôt dans la bibliothèque de conseils du patient.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-care">Visible par le patient</p><h3 className="mt-1 text-lg font-semibold text-foreground">Ressources personnalisées — {pathwayLabel}</h3></div><span className="rounded-full bg-care/10 px-2 py-1 text-xs font-medium text-care">{conditionVideos.length}</span></div>
            <div className="mt-4 flex flex-col gap-3">
              {conditionVideos.length === 0 ? <p className="rounded-xl border border-dashed border-border p-4 text-sm leading-6 text-muted-foreground">Aucune ressource pour ce trouble. Les ressources générales de Kivoir restent utilisées.</p> : conditionVideos.map((video) => <article key={video.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-3"><a href={video.url} target="_blank" rel="noreferrer" aria-label={`Ouvrir ${video.title}`} className="group min-w-0 flex-1 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-care"><div className="flex items-start gap-3"><span className="mt-0.5 shrink-0 rounded-lg bg-care/10 p-2 text-care" aria-hidden="true">{video.contentType?.startsWith("video/") ? <Video className="h-4 w-4" /> : video.contentType?.startsWith("image/") ? <span className="text-sm">IMG</span> : <FileText className="h-4 w-4" />}</span><div className="min-w-0"><p className="font-semibold text-foreground group-hover:text-care">{video.title}</p><p className="mt-1 text-xs text-care">{conditions.find((condition) => condition.id === video.conditionId)?.name ?? video.conditionId}</p><p className="mt-1 text-xs text-muted-foreground">{video.source ?? video.filename ?? "Fichier partagé"}</p></div><ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-care" aria-hidden="true" /></div></a><button type="button" onClick={() => void deleteDoctorVideo(video.id)} aria-label={`Supprimer ${video.title}`} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></article>)}
            </div>
          </div>
        </div>
      </section>

      {/* Legal / positioning */}
      <section style={{ display: showNetworkConfig ? "none" : undefined }} className={`${showResourceConfig ? "order-3" : ""} mt-16 rounded-2xl border border-border bg-card p-6 md:p-8 print:hidden`}>
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
      <section style={{ display: showNetworkConfig ? "none" : undefined }} className={`${showResourceConfig ? "order-4" : ""} mt-16 print:hidden`}>
        <h2 className="text-2xl font-semibold text-foreground">Questions fréquentes</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <FaqCard
            question="Le patient doit-il créer un compte ?"
            answer="Non. Il scanne la carte QR et accède directement à son espace patient."
          />
          <FaqCard
            question="Que peut-il retrouver dans son espace ?"
            answer="Son suivi par étapes, les conseils et vidéos sélectionnés, ainsi que l’annuaire du réseau professionnel."
          />
          <FaqCard
            question="Puis-je adapter l’accompagnement ?"
            answer="Oui. Choisissez la pathologie de la carte QR et ajoutez les ressources vidéo utiles à ce parcours."
          />
          <FaqCard
            question="Kivoir remplace-t-il le suivi médical ?"
            answer="Non. Kivoir informe et oriente ; le diagnostic, les d��cisions et le suivi restent du ressort du professionnel de santé."
          />
        </div>
      </section>

      <div style={{ display: showNetworkConfig ? "none" : undefined }} className={`${showResourceConfig ? "order-5" : ""} mt-10 print:hidden`}>
        <MedicalDisclaimer />
      </div>
      </> : null}
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
