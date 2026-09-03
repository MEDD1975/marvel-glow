import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Bot, LoaderCircle, MessageCircle, Mic, Send, X } from "lucide-react";
import { askCareAgent, type CareAgentHistoryMessage } from "@/lib/care-agent";
import type { ResourceLink } from "@/lib/condition-resources";

const welcomeMessage =
  "Bonjour, je suis l’Assistant Kivoir, votre compagnon après la consultation. Vous pouvez vous exprimer librement : racontez-moi comment s’est passée votre visite, ce que vous ressentez aujourd’hui, ou ce que votre médecin vous a conseillé ou prescrit. Comment puis-je vous aider ?";

type ChatMessage = CareAgentHistoryMessage & { videos?: ResourceLink[] };

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function containsIdentifyingData(value: string) {
  return (
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(value) ||
    /(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}\b/.test(value) ||
    /\b[12]\s?\d{2}(?:\s?\d{2}){4}\s?\d{3}\s?\d{2}\b/.test(value) ||
    /\b(?:je m['’]appelle|mon nom est|je suis monsieur|je suis madame)\s+[a-zà-ÿ'-]{2,}/i.test(value) ||
    /\b\d{1,4}\s+(?:rue|avenue|boulevard|chemin|impasse|allée)\b/i.test(value)
  );
}

const initialMessages = (): ChatMessage[] => [{ role: "assistant", text: welcomeMessage }];

export function NavireChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const keepListeningRef = useRef(false);

  function stopVoiceInput() {
    keepListeningRef.current = false;
    speechRecognitionRef.current?.stop();
    speechRecognitionRef.current = null;
    setIsListening(false);
  }

  function toggleVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setPrivacyError("La saisie vocale n’est pas disponible sur ce navigateur. Vous pouvez écrire votre question.");
      return;
    }

    if (isListening) {
      stopVoiceInput();
      return;
    }

    keepListeningRef.current = true;
    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join("");
      setMessage(transcript);
      if (privacyError) setPrivacyError(null);
    };
    recognition.onend = () => {
      if (!keepListeningRef.current) {
        setIsListening(false);
        return;
      }
      window.setTimeout(() => {
        if (keepListeningRef.current) recognition.start();
      }, 100);
    };
    recognition.onerror = () => {
      if (!keepListeningRef.current) return;
      setPrivacyError("Impossible d’utiliser le microphone. Vérifiez l’autorisation de votre navigateur.");
      setIsListening(false);
    };
    speechRecognitionRef.current = recognition;
    setPrivacyError(null);
    setIsListening(true);
    recognition.start();
  }

  function closeAndForget() {
    stopVoiceInput();
    setOpen(false);
    setMessage("");
    setMessages(initialMessages());
    setPrivacyError(null);
    setIsSending(false);
  }

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
    if (containsIdentifyingData(trimmed)) {
      setPrivacyError(
        "Ce message semble contenir une information permettant de vous identifier. Retirez votre nom, vos coordonnées, votre adresse précise ou tout numéro d’identification avant de l’envoyer.",
      );
      return;
    }

    stopVoiceInput();

    const history = messages
      .slice(1)
      .slice(-8)
      .map(({ role, text }) => ({ role, text }));
    const cabinetId = new URLSearchParams(window.location.search).get("cabinet") ?? undefined;

    setPrivacyError(null);
    setMessage("");
    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setIsSending(true);

    try {
      const response = await askCareAgent({ data: { message: trimmed, history, cabinetId } });
      setMessages((current) => [...current, { role: "assistant", text: response.text, videos: response.videos }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "Je ne parviens pas à répondre pour le moment. Continuez à suivre les consignes données lors de votre consultation. Si votre situation vous préoccupe, évolue défavorablement ou si vous avez un doute, recontactez votre médecin. En cas d’urgence, appelez le 15 ou le 112.\n\nJe vous invite à consulter l’annuaire du réseau de soins pour trouver le professionnel adapté près de chez vous.\n\n⚠️ Kivoir est un outil d'accompagnement au parcours de soin et ne remplace pas une consultation médicale.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
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
              onClick={closeAndForget}
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
                    {item.text}
                  </div>
                  {item.videos?.length ? (
                    <section className="w-full max-w-[88%] rounded-xl border border-border bg-card p-3" aria-label="Vidéos d'information recommandées">
                      <p className="text-xs font-semibold text-card-foreground">Pour mieux comprendre</p>
                      <div className="mt-2 flex flex-col gap-2">
                        {item.videos.map((video) => (
                          <a
                            key={video.url}
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-border bg-background p-2.5 text-xs transition-colors hover:border-primary/50"
                          >
                            <span className="block font-semibold text-primary">{video.label}</span>
                            <span className="mt-1 block text-muted-foreground">Source : {video.source}</span>
                          </a>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] leading-4 text-muted-foreground">Information générale, à regarder en complément des consignes de votre professionnel.</p>
                    </section>
                  ) : null}
                  {item.role === "assistant" && index > 0 ? (
                    <Link
                      to="/annuaire"
                      search={{}}
                      className="inline-flex max-w-[88%] items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      Accéder à l'annuaire du réseau de soins
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
              <button
                type="button"
                onClick={toggleVoiceInput}
                aria-label={isListening ? "Arrêter la saisie vocale" : "Parler à l’Assistant Kivoir"}
                aria-pressed={isListening}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isListening ? "bg-destructive text-destructive-foreground animate-pulse" : "text-primary hover:bg-primary/10"}`}
              >
                <Mic className="h-4 w-4" aria-hidden="true" />
              </button>
              <textarea
                ref={messageInputRef}
                id="navire-message"
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  if (privacyError) setPrivacyError(null);
                }}
                aria-describedby="kivoir-privacy-note kivoir-privacy-error"
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
            {isListening ? <p className="mt-2 px-1 text-xs text-primary">Je vous écoute…</p> : null}
            {privacyError ? (
              <p id="kivoir-privacy-error" role="alert" className="mt-2 px-1 text-xs leading-5 text-destructive">
                {privacyError}
              </p>
            ) : null}
            <p id="kivoir-privacy-note" className="mt-2 px-1 text-[11px] leading-4 text-muted-foreground">
              Conversation temporaire, effacée à la fermeture. Ne partagez ni nom, ni coordonnées, ni identifiant. Kivoir est un outil d&apos;accompagnement au parcours de soin et ne remplace pas une consultation médicale.
            </p>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => (open ? closeAndForget() : setOpen(true))}
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
