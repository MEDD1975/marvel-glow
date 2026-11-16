import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileDown,
  Printer,
  QrCode,
  Share2,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { conditions } from "@/lib/conditions";
import { useCabinetRef, useDoctorResources } from "@/components/doctor/use-doctor-data";
import { resourceKind, resourceKindLabels } from "@/lib/doctor-pathway-info";
import {
  DEFAULT_KINE_LIBRARY_PATHWAY,
  getKineLibraryPathwaySelection,
} from "@/lib/kine-library-pathway";

export const Route = createFileRoute("/cabinet/kine")({
  component: KineWorkspace,
});

function KineWorkspace() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user as { role?: string; profession?: string } | undefined;
  const role = currentUser?.role;
  const canAccess =
    role === "kine" ||
    role === "kinesitherapeute" ||
    role === "admin_kivoir" ||
    currentUser?.profession === "kinesitherapeute";
  const hasKineAccess = !isPending && canAccess;
  const resources = useDoctorResources(session?.user?.id, hasKineAccess);
  const cabinetRef = useCabinetRef(hasKineAccess);
  const [transmissionOpen, setTransmissionOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [hiddenItems, setHiddenItems] = useState<string[]>([]);
  const [selectedCondition, setSelectedCondition] = useState("");
  const selectedTransmission = conditions.find((condition) => condition.id === selectedCondition);
  const [patientLabel, setPatientLabel] = useState("");
  const [transmissionQr, setTransmissionQr] = useState<{ image: string; url: string } | null>(null);
  const [qrError, setQrError] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!transmissionOpen) return;

    const scrollY = window.scrollY;
    const previousBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    const previousRootOverflow = document.documentElement.style.overflow;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.left = previousBodyStyles.left;
      document.body.style.right = previousBodyStyles.right;
      document.body.style.width = previousBodyStyles.width;
      document.body.style.overflow = previousBodyStyles.overflow;
      document.documentElement.style.overflow = previousRootOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [transmissionOpen]);

  useEffect(() => {
    if (transmissionQr) previewScrollRef.current?.scrollTo({ top: 0 });
  }, [transmissionQr]);

  const qrActionButtonClass =
    "flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d4e2da] bg-white px-3 text-sm font-semibold text-[#315a4c] transition hover:bg-[#f8fbf8]";

  const printTransmissionQr = () => {
    document.body.classList.add("printing-kine-qr");
    const clearPrintMode = () => document.body.classList.remove("printing-kine-qr");
    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.print();
    window.setTimeout(clearPrintMode, 1000);
  };

  const shareTransmissionQr = async () => {
    if (!transmissionQr) return;
    setQrError("");
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Kivoir — ${selectedTransmission?.name ?? "Parcours patient"}`,
          text: "Parcours de suivi patient",
          url: transmissionQr.url,
        });
        return;
      }
      const link = document.createElement("a");
      link.href = transmissionQr.image;
      link.download = "kivoir-qr-code.png";
      link.click();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setQrError("Le partage n’a pas pu s’ouvrir. Copiez le lien ou téléchargez le QR code.");
    }
  };

  const copyTransmissionLink = async () => {
    if (!transmissionQr) return;
    setQrError("");
    try {
      await navigator.clipboard.writeText(transmissionQr.url);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      setQrError("Copie impossible. Vous pouvez sélectionner le lien affiché sous le QR code.");
    }
  };

  const exportTransmissionPdf = async () => {
    if (!transmissionQr) return;
    setQrError("");
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      pdf.setTextColor(23, 56, 47);
      pdf.setFontSize(18);
      pdf.text("Kivoir — Parcours patient", 20, 24);
      pdf.setFontSize(12);
      pdf.text(selectedTransmission?.name ?? "Parcours patient", 20, 34);
      pdf.setFontSize(10);
      pdf.text("Scannez ce QR code pour accéder au parcours patient.", 20, 42);
      pdf.addImage(transmissionQr.image, "PNG", 20, 50, 82, 82);
      pdf.text("Lien patient :", 20, 142);
      pdf.text(pdf.splitTextToSize(transmissionQr.url, 165), 20, 149);
      pdf.save("kivoir-parcours-patient.pdf");
    } catch {
      setQrError("Impossible de créer le PDF. Téléchargez le QR code ou imprimez-le.");
    }
  };

  const startTransmission = (conditionId = "") => {
    const nextConditionId =
      conditionId || getKineLibraryPathwaySelection() || DEFAULT_KINE_LIBRARY_PATHWAY;
    setSelectedCondition(nextConditionId);
    setHiddenItems([]);
    setPreviewOpen(false);
    setTransmissionQr(null);
    setQrError("");
    setLinkCopied(false);
    setTransmissionOpen(true);
  };
  const transmissionItems = (resources.data ?? []).filter(
    (item) => item.status === "active" && item.conditionId === selectedCondition,
  );
  const selectedItems = transmissionItems
    .filter((item) => !hiddenItems.includes(item.id))
    .map((item) => item.id);

  const toggleItem = (id: string) => {
    setHiddenItems((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };
  if (isPending)
    return <p className="p-8 text-sm text-muted-foreground">Vérification de votre accès…</p>;
  if (!canAccess) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <section className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#177e78]">
            Espace kinésithérapeute
          </p>
          <h1 className="mt-3 text-2xl font-bold text-foreground">
            Cet espace est réservé aux comptes kiné.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Connectez-vous avec une entrée kiné dédiée ou demandez une invitation professionnelle.
          </p>
          <Link
            to="/connexion-kine"
            className="mt-6 inline-flex rounded-xl bg-[#177e78] px-4 py-3 font-semibold text-white"
          >
            Accéder à la connexion kiné
          </Link>
        </section>
      </main>
    );
  }
  if (pathname.startsWith("/cabinet/kine/")) return <Outlet />;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8 md:py-10">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#177e78]">
          Espace kinésithérapeute
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Prolongez vos séances à la maison.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Créez votre bibliothèque une fois, puis transmettez en quelques clics les contenus
          réellement montrés pendant chaque séance.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Actions principales">
        <Link
          to="/cabinet/kine/ressources"
          className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#177e78]/40 hover:shadow-md"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#177e78]/10 text-[#177e78]">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-bold text-foreground">Ma bibliothèque</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Vos vidéos, fiches et conseils personnels, classés par trouble et par phase.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#177e78]">
            Gérer mes contenus <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
        <button
          type="button"
          onClick={() => startTransmission()}
          className="group rounded-2xl bg-[#177e78] p-5 text-left text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#177e78]/90 hover:shadow-md"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <QrCode className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-bold">Nouvelle transmission</h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Sélectionnez les contenus montrés aujourd’hui et transmettez-les par QR code.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
            Commencer <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </button>
        <Link
          to="/cabinet/kine/transmissions"
          className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#177e78]/40 hover:shadow-md"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3EFE6] text-[#9A6B28]">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-bold text-foreground">Mes transmissions</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Retrouvez ce qui a déjà été envoyé et reprenez le fil à la séance suivante.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#177e78]">
            Voir l’historique <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </section>

      {transmissionOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setTransmissionOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="transmission-title"
            className="flex h-[92dvh] max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[2rem] border border-[#cfe2d6] bg-[#f1f8f3] shadow-2xl sm:h-auto sm:rounded-3xl"
          >
            <header className="shrink-0 border-b border-[#d4e5da] bg-[#f1f8f3] px-5 pb-5 pt-3 sm:px-7 sm:pt-6">
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#215346]/20 sm:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#177e78] shadow-sm ring-1 ring-[#d4e5da]">
                    <BookOpen className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#177e78]">
                      Nouvelle transmission
                    </p>
                    <h2
                      id="transmission-title"
                      className="mt-1 text-2xl font-bold tracking-tight text-[#17382f] sm:text-3xl"
                    >
                      {previewOpen ? "Prévisualisation patient" : "Préparer la séance"}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Fermer"
                  onClick={() => setTransmissionOpen(false)}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>
            <div
              ref={previewScrollRef}
              className={`min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] ${
                transmissionQr ? "px-5 py-3 sm:px-7 sm:py-4" : "px-5 py-5 sm:px-7"
              }`}
            >
              {previewOpen ? (
                <div className="flex flex-col gap-5">
                  {!transmissionQr ? (
                    <>
                      <div className="rounded-2xl border border-[#d4e5da] bg-white/80 p-4 shadow-sm">
                        <p className="text-sm text-slate-600">Parcours</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedTransmission?.name ?? "Parcours patient"}
                        </p>
                        {patientLabel.trim() && (
                          <p className="mt-2 text-sm text-slate-600">
                            Repère patient : {patientLabel}
                          </p>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">Contenus transmis</h3>
                        <ul className="mt-2 flex flex-col gap-2">
                          {selectedItems.map((id) => {
                            const item = resources.data?.find((resource) => resource.id === id);
                            return item ? (
                              <li
                                key={item.id}
                                className="rounded-2xl border border-[#d4e2da] bg-white px-4 py-3 text-sm text-[#203d34] shadow-sm"
                              >
                                {item.title}
                              </li>
                            ) : null;
                          })}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-[#cfe2d6] bg-white px-4 py-3 text-center shadow-sm">
                        <p className="font-semibold text-slate-900" role="status">
                          QR code généré
                        </p>
                        <img
                          src={transmissionQr.image}
                          alt={`QR code du parcours ${selectedTransmission?.name ?? "Parcours patient"}`}
                          className="mx-auto mt-2 size-[min(34dvh,13rem)] max-w-[62vw] rounded-xl bg-white p-2"
                        />
                        <a
                          href={transmissionQr.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block text-sm font-semibold text-[#177e78] underline"
                        >
                          Ouvrir le lien patient
                        </a>
                        <p className="mt-1 select-all break-all text-xs text-slate-500">
                          {transmissionQr.url}
                        </p>
                      </div>
                      <div
                        role="group"
                        aria-label="Partager ou enregistrer le QR code"
                        className="grid grid-cols-2 gap-2"
                      >
                        <button
                          type="button"
                          onClick={printTransmissionQr}
                          className={qrActionButtonClass}
                        >
                          <Printer className="h-4 w-4" aria-hidden="true" />
                          Imprimer
                        </button>
                        <button
                          type="button"
                          onClick={() => void shareTransmissionQr()}
                          className={qrActionButtonClass}
                        >
                          <Share2 className="h-4 w-4" aria-hidden="true" />
                          Partager
                        </button>
                        <button
                          type="button"
                          onClick={() => void copyTransmissionLink()}
                          className={qrActionButtonClass}
                        >
                          {linkCopied ? (
                            <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                          ) : (
                            <Copy className="h-4 w-4" aria-hidden="true" />
                          )}
                          {linkCopied ? "Lien copié" : "Copier le lien"}
                        </button>
                        <a
                          href={transmissionQr.image}
                          download="kivoir-qr-code.png"
                          className={qrActionButtonClass}
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          Télécharger le QR
                        </a>
                        <button
                          type="button"
                          onClick={() => void exportTransmissionPdf()}
                          className={`${qrActionButtonClass} col-span-2`}
                        >
                          <FileDown className="h-4 w-4" aria-hidden="true" />
                          Exporter en PDF
                        </button>
                        <p aria-live="polite" className="sr-only">
                          {linkCopied ? "Lien du patient copié dans le presse-papiers" : ""}
                        </p>
                      </div>
                    </>
                  )}
                  {qrError ? (
                    <p role="alert" className="text-sm text-red-700">
                      {qrError}
                    </p>
                  ) : null}
                  <div className="-mx-5 flex flex-col-reverse gap-3 border-t border-[#d4e5da] bg-[#f1f8f3] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:-mx-7 sm:flex-row sm:justify-between sm:px-7">
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(false)}
                      className="min-h-12 w-full rounded-2xl border border-[#d4e2da] bg-white px-5 py-3 text-base font-semibold text-[#315a4c] transition hover:bg-[#f8fbf8] sm:w-auto"
                    >
                      Modifier la sélection
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setQrError("");
                        const condition = selectedTransmission;
                        const cabinetId = cabinetRef.data?.ref;
                        if (!condition || !cabinetId) {
                          setQrError("Le parcours ou le cabinet est indisponible. Réessayez.");
                          return;
                        }
                        try {
                          const patientUrl = new URL("/parcours-kine", window.location.origin);
                          patientUrl.searchParams.set("pathway", condition.id);
                          patientUrl.searchParams.set("ref", cabinetId);
                          patientUrl.searchParams.set("items", selectedItems.join(","));
                          patientUrl.searchParams.set(
                            "focus",
                            selectedTransmission?.name ?? "Parcours patient",
                          );
                          const url = patientUrl.toString();
                          const qr = await import("qrcode");
                          const image = await qr.default.toDataURL(url, {
                            width: 480,
                            margin: 1,
                            errorCorrectionLevel: "H",
                          });
                          setTransmissionQr({ image, url });
                        } catch {
                          setQrError(
                            "Impossible de générer le QR code. Vérifiez la connexion puis réessayez.",
                          );
                        }
                      }}
                      disabled={!cabinetRef.data?.ref}
                      className="min-h-12 w-full rounded-2xl bg-[#279b6b] px-5 py-3 text-base font-semibold text-white shadow-md shadow-[#215346]/10 transition hover:bg-[#208b60] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      <span key={transmissionQr ? "qr-ready" : "qr-action"}>
                        {transmissionQr ? "Régénérer le QR code" : "Générer le QR code"}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#315a4c]">
                      Parcours / motif
                    </span>
                    <select
                      value={selectedCondition}
                      required
                      onChange={(event) => {
                        const nextConditionId = event.target.value;
                        setSelectedCondition(nextConditionId);
                        setHiddenItems([]);
                        setTransmissionQr(null);
                        setQrError("");
                      }}
                      className="min-h-12 w-full rounded-2xl border border-[#d4e2da] bg-white px-4 text-base font-medium text-[#203d34] shadow-sm outline-none transition focus:border-[#178d86] focus:ring-2 focus:ring-[#178d86]/15"
                    >
                      <option value="" disabled>
                        Choisir un parcours
                      </option>
                      {conditions.map((condition) => (
                        <option key={condition.id} value={condition.id}>
                          {condition.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#315a4c]">
                      Repère patient{" "}
                      <span className="font-normal text-[#688277]">(facultatif)</span>
                    </span>
                    <input
                      value={patientLabel}
                      onChange={(event) => setPatientLabel(event.target.value)}
                      maxLength={50}
                      placeholder="Initiales ou repère local"
                      className="min-h-12 w-full rounded-2xl border border-[#d4e2da] bg-white px-4 text-base text-[#203d34] shadow-sm outline-none transition placeholder:text-[#8aa398] focus:border-[#178d86] focus:ring-2 focus:ring-[#178d86]/15"
                    />
                  </label>
                  <fieldset>
                    <legend className="mb-3 flex w-full items-center justify-between gap-3 text-sm font-semibold text-[#315a4c]">
                      <span>Sélectionnez les contenus montrés</span>
                      <span className="shrink-0 rounded-full bg-[#e3f1e8] px-3 py-1 text-xs font-semibold text-[#177e78]">
                        {selectedItems.length} sélectionné{selectedItems.length > 1 ? "s" : ""}
                      </span>
                    </legend>
                    <div className="flex flex-col gap-2">
                      {!selectedCondition ? (
                        <p className="rounded-2xl border border-dashed border-[#c6dace] bg-white/70 p-4 text-sm text-[#668075]">
                          Choisissez d’abord un parcours pour afficher les contenus associés.
                        </p>
                      ) : transmissionItems.length ? (
                        transmissionItems.map((item) => {
                          const isSelected = selectedItems.includes(item.id);
                          const visibilityAction = isSelected ? "Masquer" : "Afficher";
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 rounded-2xl border border-[#d4e2da] bg-white shadow-sm transition-colors has-[:checked]:border-[#178d86] has-[:checked]:bg-[#e8f4ec]"
                            >
                              <label
                                htmlFor={`transmission-item-${item.id}`}
                                className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-2xl p-4"
                              >
                                <input
                                  id={`transmission-item-${item.id}`}
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleItem(item.id)}
                                  className="mt-1 size-5 shrink-0 accent-[#177e78]"
                                />
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold text-slate-900">
                                    {item.title}
                                  </span>
                                  <span className="mt-1 block text-sm text-[#688277]">
                                    {resourceKindLabels[resourceKind(item)]}
                                  </span>
                                </span>
                              </label>
                              <button
                                type="button"
                                onClick={() => toggleItem(item.id)}
                                aria-label={`${visibilityAction} ${item.title} pour cette transmission`}
                                title={`${visibilityAction} pour cette transmission`}
                                className="mr-3 flex size-10 shrink-0 items-center justify-center rounded-xl text-[#315a4c] transition hover:bg-[#dceee5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#178d86]"
                              >
                                {isSelected ? (
                                  <EyeOff className="size-5" aria-hidden="true" />
                                ) : (
                                  <Eye className="size-5" aria-hidden="true" />
                                )}
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="rounded-2xl border border-dashed border-[#c6dace] bg-white/70 p-4 text-sm text-[#668075]">
                          Aucun contenu actif n’est encore associé à ce parcours.
                        </p>
                      )}
                    </div>
                  </fieldset>
                  <div className="-mx-5 flex flex-col-reverse gap-3 border-t border-[#d4e5da] bg-[#f1f8f3] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:-mx-7 sm:flex-row sm:justify-end sm:px-7">
                    <button
                      type="button"
                      onClick={() => setTransmissionOpen(false)}
                      className="min-h-12 w-full rounded-2xl border border-[#d4e2da] bg-white px-5 py-3 text-base font-semibold text-[#315a4c] transition hover:bg-[#f8fbf8] sm:w-auto"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      disabled={selectedItems.length === 0}
                      onClick={() => setPreviewOpen(true)}
                      className="min-h-12 w-full rounded-2xl bg-[#279b6b] px-5 py-3 text-base font-semibold text-white shadow-md shadow-[#215346]/10 transition hover:bg-[#208b60] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      Prévisualiser ({selectedItems.length})
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
          {transmissionQr ? (
            <div className="kine-qr-print-sheet" aria-hidden="true">
              <p className="text-sm font-semibold uppercase tracking-wide">
                Kivoir · Parcours patient
              </p>
              <h1 className="mt-4 text-3xl font-bold">
                {selectedTransmission?.name ?? "Parcours patient"}
              </h1>
              <p className="mt-3 text-base">Scannez ce QR code pour accéder au parcours patient.</p>
              <img
                src={transmissionQr.image}
                alt=""
                className="mx-auto mt-8 h-80 w-80 object-contain"
              />
              <p className="mt-8 break-all text-sm">{transmissionQr.url}</p>
            </div>
          ) : null}
        </div>
      )}
    </main>
  );
}
