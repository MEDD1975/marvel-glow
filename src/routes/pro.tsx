import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  ClipboardCheck,
  Copy,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
} from "lucide-react";

export const Route = createFileRoute("/pro")({
  head: () => ({
    meta: [
      { title: "Espace praticien — Récupérer une synthèse | Kivoir" },
      {
        name: "description",
        content:
          "Scannez le QR code présenté par le patient depuis la webcam de votre ordinateur et copiez la synthèse dans votre logiciel métier. Aucune donnée enregistrée.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProPage,
});

type ScanState = "idle" | "starting" | "scanning" | "result" | "error";

function ProPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);
  const [state, setState] = useState<ScanState>("idle");
  const [result, setResult] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const stopScanner = useCallback(() => {
    const scanner = scannerRef.current;
    if (scanner) {
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    setState("starting");
    setErrorMsg("");
    setResult("");
    try {
      const QrScanner = (await import("qr-scanner")).default;
      const video = videoRef.current;
      if (!video) return;

      const scanner = new QrScanner(
        video,
        (res: { data: string }) => {
          if (!res?.data) return;
          setResult(res.data);
          setState("result");
          scanner.stop();
        },
        {
          preferredCamera: "environment",
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 8,
        },
      );
      scannerRef.current = scanner;
      await scanner.start();
      setState("scanning");
    } catch (err) {
      console.log("[v0] scanner error:", err);
      stopScanner();
      setState("error");
      setErrorMsg(
        err instanceof Error && /permission|denied|notallowed/i.test(err.message + err.name)
          ? "Accès à la caméra refusé. Autorisez la webcam dans votre navigateur puis réessayez."
          : "Impossible de démarrer la caméra. Vérifiez qu'une webcam est disponible et non utilisée par une autre application.",
      );
    }
  }, [stopScanner]);

  useEffect(() => {
    return () => stopScanner();
  }, [stopScanner]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const scanNext = () => {
    setResult("");
    setCopied(false);
    void startScanner();
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-care/20 bg-care/5 px-3 py-1 text-xs font-medium text-care">
          <Stethoscope className="h-3.5 w-3.5" />
          Espace praticien
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          Récupérer la synthèse d'un patient
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Le patient affiche son QR code. Scannez-le avec la webcam de votre ordinateur : la synthèse s'affiche ici,
          prête à coller dans votre logiciel. Rien n'est enregistré ni transmis.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        {/* Zone caméra */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted sm:aspect-video">
          <video
            ref={videoRef}
            className={`h-full w-full object-cover ${state === "scanning" ? "" : "hidden"}`}
            playsInline
            muted
          />

          {state !== "scanning" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              {state === "result" ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-care/10 text-care">
                    <ClipboardCheck className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Synthèse récupérée</p>
                </>
              ) : state === "error" ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <CameraOff className="h-7 w-7" />
                  </div>
                  <p className="max-w-sm text-sm text-muted-foreground">{errorMsg}</p>
                </>
              ) : state === "starting" ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-care/10 text-care">
                    <Camera className="h-7 w-7 animate-pulse" />
                  </div>
                  <p className="text-sm text-muted-foreground">Démarrage de la caméra…</p>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-care/10 text-care">
                    <ScanLine className="h-7 w-7" />
                  </div>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Cliquez sur « Activer la caméra », autorisez l'accès, puis présentez le QR code du patient devant la
                    webcam.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions caméra */}
        <div className="mt-4 flex flex-wrap gap-2">
          {state === "idle" && (
            <button
              onClick={() => void startScanner()}
              className="inline-flex items-center gap-2 rounded-lg bg-care px-4 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-care/90"
            >
              <Camera className="h-4 w-4" />
              Activer la caméra
            </button>
          )}

          {(state === "scanning" || state === "starting") && (
            <button
              onClick={() => {
                stopScanner();
                setState("idle");
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
            >
              <CameraOff className="h-4 w-4" />
              Arrêter la caméra
            </button>
          )}

          {state === "error" && (
            <button
              onClick={() => void startScanner()}
              className="inline-flex items-center gap-2 rounded-lg bg-care px-4 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-care/90"
            >
              <RotateCcw className="h-4 w-4" />
              Réessayer
            </button>
          )}

          {state === "result" && (
            <button
              onClick={scanNext}
              className="inline-flex items-center gap-2 rounded-lg border border-care/40 px-4 py-3 text-base font-medium text-care transition-colors hover:bg-care/10"
            >
              <ScanLine className="h-4 w-4" />
              Scanner le patient suivant
            </button>
          )}
        </div>
      </section>

      {/* Résultat */}
      {state === "result" && (
        <section className="mt-6 rounded-2xl border border-care/20 bg-care/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-foreground">Synthèse de pré-consultation</h2>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-lg bg-care px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-care/90"
            >
              {copied ? <ClipboardCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copié" : "Copier pour le dossier"}
            </button>
          </div>
          <textarea
            readOnly
            value={result}
            rows={Math.min(20, Math.max(8, result.split("\n").length + 1))}
            className="mt-4 w-full resize-y rounded-lg border border-border bg-background p-4 font-mono text-sm leading-relaxed text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-care" />
            Contenu déclaratif du patient, décodé localement depuis le QR code. Ne constitue ni un diagnostic ni une aide
            à la décision médicale. Aucune donnée n'est enregistrée ni transmise à un serveur.
          </p>
        </section>
      )}

      {/* Prérequis */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <TriangleAlert className="h-4 w-4 text-care" />
          Bon à savoir
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>La caméra n'est accessible que sur une connexion sécurisée (https) : c'est le cas sur le site publié.</li>
          <li>Le patient augmente la luminosité de son écran pour un scan plus rapide.</li>
          <li>Aucune image n'est enregistrée : le flux vidéo sert uniquement à lire le code, en direct.</li>
        </ul>
      </section>
    </main>
  );
}
