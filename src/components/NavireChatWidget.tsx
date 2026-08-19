import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { askCareAgent } from "@/lib/care-agent";

const welcomeMessage =
  "Bonjour, je suis l’Assistant Kivoir, votre compagnon après la consultation. Vous pouvez vous exprimer librement : racontez-moi comment s’est passée votre visite, ce que vous ressentez aujourd’hui, ou ce que votre médecin vous a conseillé ou prescrit. Comment puis-je vous aider ?";

type LocalPractitioner = {
  nom: string;
  prenom: string;
  specialite: string;
  adresse: string;
  telephone: string;
  codePostal: string;
  ville: string;
  secteur: string;
};

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  practitioners?: LocalPractitioner[];
};

const DIRECTORY_NOTICE =
  "Cette liste est donnée à titre indicatif pour vous aider à trouver un praticien près de chez vous.";
const SAFETY_NOTICE =
  "Kivoir est un outil d'accompagnement au parcours de soin et ne remplace pas une consultation médicale.";

function visibleMessageText(item: ChatMessage) {
  if (!item.practitioners?.length) return item.text;
  return item.text.replace(`⚠️ ${SAFETY_NOTICE}`, "").trim();
}

const responseHeadings = new Set([
  "**Rassurer & Conseiller**",
  "**Détecter le besoin**",
  "**Orienter**",
]);

function StructuredMessage({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2">
      {text.split("\n").filter(Boolean).map((line, index) =>
        responseHeadings.has(line.trim()) ? (
          <strong key={`${line}-${index}`} className="mt-1 block text-sm font-semibold text-primary first:mt-0">
            {line.replaceAll("**", "")}
          </strong>
        ) : (
          <span key={`${line}-${index}`} className="block">
            {line}
          </span>
        ),
      )}
    </div>
  );
}

export function NavireChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [directoryHref, setDirectoryHref] = useState("/annuaire");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: welcomeMessage },
  ]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const cabinetId = new URLSearchParams(window.location.search).get("cabinet");
    setDirectoryHref(cabinetId ? `/annuaire?cabinet=${encodeURIComponent(cabinetId)}` : "/annuaire");
  }, []);

  useEffect(() => {
    function openAssistant() {
      setOpen(true);
    }

    window.addEventListener("kivoir:open-assistant", openAssistant);
    return () => window.removeEventListener("kivoir:open-assistant", openAssistant);
  }, []);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => messageInputRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setMessage("");
    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setIsSending(true);

    try {
      const response = await askCareAgent({ data: { message: trimmed } });
      setMessages((current) => [
        ...current,
        { role: "assistant", text: response.text, practitioners: response.practitioners },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "**Rassurer & Conseiller**\nJe ne parviens pas à répondre pour le moment. Continuez à suivre les consignes données lors de votre consultation.\n\n**Détecter le besoin**\nSi votre situation vous préoccupe, évolue défavorablement ou si vous avez un doute, recontactez votre médecin. En cas d’urgence, appelez le 15 ou le 112.\n\n**Orienter**\nVous pouvez consulter le réseau de soins de votre cabinet dans l’Annuaire Kivoir.\n\n⚠️ Kivoir est un outil d'accompagnement au parcours de soin et ne remplace pas une consultation médicale.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          id="navire-chat-widget"
          aria-label="Discussion avec Assistant Kivoir"
          className="flex h-[min(620px,calc(100vh-120px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl shadow-primary/10"
        >
          <header className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold">Assistant Kivoir</h2>
                <p className="text-xs text-primary-foreground/75">Suivi post-consultation</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer la discussion"
              className="rounded-full p-2 transition-colors hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4" aria-live="polite">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex w-full flex-col items-start gap-2">
                  <div
                    className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                      item.role === "user"
                        ? "self-end rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border border-border bg-card text-card-foreground"
                    }`}
                  >
                    {item.role === "assistant" ? (
                      <StructuredMessage text={visibleMessageText(item)} />
                    ) : (
                      visibleMessageText(item)
                    )}
                  </div>
                  {item.practitioners?.length ? (
                    <section
                      aria-label="Résultats de l'annuaire à Saint-Maur-des-Fossés"
                      className="w-full rounded-xl border border-border bg-card p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                        <h3 className="text-sm font-semibold text-card-foreground">
                          Professionnels à Saint-Maur-des-Fossés
                        </h3>
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {item.practitioners.length} résultat{item.practitioners.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 pt-3">
                        {item.practitioners.map((practitioner) => (
                          <article
                            key={`${practitioner.nom}-${practitioner.prenom}-${practitioner.adresse}`}
                            className="rounded-xl border border-border bg-muted/40 p-3 text-sm text-card-foreground"
                          >
                            <p className="font-semibold text-balance">
                              {[practitioner.prenom, practitioner.nom].filter(Boolean).join(" ")}
                            </p>
                            <p className="mt-1 text-xs font-medium text-primary">{practitioner.specialite}</p>
                            <address className="mt-2 not-italic leading-5 text-muted-foreground">
                              {practitioner.adresse}
                              <br />
                              {practitioner.codePostal} {practitioner.ville}
                            </address>
                            {practitioner.telephone ? (
                              <a
                                className="mt-2 inline-flex font-semibold text-primary underline-offset-2 hover:underline"
                                href={`tel:${practitioner.telephone}`}
                              >
                                {practitioner.telephone.replace(/(\d{2})(?=\d)/g, "$1 ")}
                              </a>
                            ) : null}
                          </article>
                        ))}
                      </div>
                      <p className="pt-3 text-xs leading-5 text-muted-foreground">{DIRECTORY_NOTICE}</p>
                    </section>
                  ) : null}
                  {item.role === "assistant" && index > 0 ? (
                    <Link
                      to={directoryHref}
                      className="inline-flex max-w-[88%] items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      Consulter le réseau de soins de mon cabinet
                      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
            {isSending ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Assistant Kivoir répond">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Assistant Kivoir prépare sa réponse…
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-border bg-card p-3">
            <label htmlFor="navire-message" className="sr-only">
              Votre message à Assistant Kivoir
            </label>
            <div className="flex items-end gap-2 rounded-xl border border-input bg-background p-1.5 focus-within:ring-2 focus-within:ring-ring">
              <textarea
                ref={messageInputRef}
                id="navire-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Décrivez votre question…"
                rows={2}
                maxLength={800}
                disabled={isSending}
                className="min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-1 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!message.trim() || isSending}
                aria-label="Envoyer le message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 px-1 text-[11px] leading-4 text-muted-foreground">
              {SAFETY_NOTICE}
            </p>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="navire-chat-widget"
        aria-label={open ? "Fermer Assistant Kivoir" : "Ouvrir Assistant Kivoir"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <MessageCircle className="h-6 w-6" aria-hidden="true" />}
      </button>
    </div>
  );
}
