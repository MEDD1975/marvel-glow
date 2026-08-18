import { useMemo, useState } from "react";
import { Mail, MessageSquareText, Printer, QrCode, Send } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { Cabinet } from "@/lib/directory";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ShareMode = "sms" | "email";

const PUBLIC_APP_ORIGIN = "https://kivoir.vercel.app";

function cabinetUrl(cabinetId: string) {
  return `${PUBLIC_APP_ORIGIN}/annuaire?cabinet=${encodeURIComponent(cabinetId)}`;
}

export function DirectoryShareTools({ cabinet }: { cabinet: Cabinet }) {
  const [shareMode, setShareMode] = useState<ShareMode>("sms");
  const [contact, setContact] = useState("");
  const url = useMemo(() => cabinetUrl(cabinet.id), [cabinet.id]);
  const message = `Voici le réseau de soins ${cabinet.name} sur Kivoir : ${url}`;

  function openNativeShare() {
    const target = contact.trim();
    if (!target) return;

    const href =
      shareMode === "email"
        ? `mailto:${encodeURIComponent(target)}?subject=${encodeURIComponent(`Réseau de soins — ${cabinet.name}`)}&body=${encodeURIComponent(message)}`
        : `sms:${target.replace(/[^+\d]/g, "")}?&body=${encodeURIComponent(message)}`;
    window.location.href = href;
  }

  function printDirectory() {
    document.body.classList.add("printing-directory");
    window.addEventListener(
      "afterprint",
      () => document.body.classList.remove("printing-directory"),
      { once: true },
    );
    window.print();
  }

  return (
    <>
      <section className="print-hidden mt-5 rounded-2xl border border-border bg-card p-3 shadow-sm" aria-labelledby="share-tools-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="share-tools-title" className="text-sm font-semibold text-foreground">Partager ce réseau de soins</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">À montrer ou transmettre au patient pendant la consultation.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><QrCode className="h-4 w-4" /> Afficher le QR code</Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm bg-card text-card-foreground">
                <DialogHeader>
                  <DialogTitle>Scanner le réseau de soins</DialogTitle>
                  <DialogDescription>Ce QR code ouvre directement la page de {cabinet.name}.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <QRCodeSVG value={url} size={220} level="M" title={`QR code vers ${cabinet.name}`} />
                  </div>
                  <p className="max-w-full break-all text-center text-xs text-muted-foreground">{url}</p>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Send className="h-4 w-4" /> Partager par SMS / Email</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-card text-card-foreground">
                <DialogHeader>
                  <DialogTitle>Partager avec le patient</DialogTitle>
                  <DialogDescription>Aucune coordonnée n’est enregistrée par Kivoir. Votre application SMS ou email prendra le relais.</DialogDescription>
                </DialogHeader>
                <div className="flex gap-2" role="group" aria-label="Canal de partage">
                  <Button type="button" size="sm" variant={shareMode === "sms" ? "default" : "outline"} onClick={() => { setShareMode("sms"); setContact(""); }}>
                    <MessageSquareText className="h-4 w-4" /> SMS
                  </Button>
                  <Button type="button" size="sm" variant={shareMode === "email" ? "default" : "outline"} onClick={() => { setShareMode("email"); setContact(""); }}>
                    <Mail className="h-4 w-4" /> Email
                  </Button>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="patient-contact">{shareMode === "sms" ? "Numéro de téléphone" : "Adresse email"}</Label>
                  <Input
                    id="patient-contact"
                    type={shareMode === "sms" ? "tel" : "email"}
                    inputMode={shareMode === "sms" ? "tel" : "email"}
                    autoComplete={shareMode === "sms" ? "tel" : "email"}
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    placeholder={shareMode === "sms" ? "06 12 34 56 78" : "patient@exemple.fr"}
                  />
                </div>
                <Button type="button" disabled={!contact.trim()} onClick={openNativeShare}>
                  Ouvrir l’application {shareMode === "sms" ? "SMS" : "email"}
                </Button>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={printDirectory}>
              <Printer className="h-4 w-4" /> Exporter en PDF
            </Button>
          </div>
        </div>
      </section>

      <section className="directory-print-sheet" aria-hidden="true">
        <header className="directory-print-header">
          <div>
            <p className="directory-print-brand">Kivoir · Réseau de soins</p>
            <h1>{cabinet.name}</h1>
            <p>Annuaire remis au patient</p>
          </div>
          <QRCodeSVG value={url} size={108} level="M" title={`QR code vers ${cabinet.name}`} />
        </header>
        <div className="directory-print-list">
          {cabinet.providers.map((provider) => (
            <article key={provider.id}>
              <h2>{provider.name}</h2>
              <p className="directory-print-specialty">{provider.profession}</p>
              <p>{provider.address}<br />{provider.postalCode} {provider.city}</p>
              {provider.formattedPhone ? <p className="directory-print-phone">{provider.formattedPhone}</p> : null}
            </article>
          ))}
        </div>
        <footer>Scannez le QR code pour retrouver cette liste à jour sur Kivoir.</footer>
      </section>
    </>
  );
}
