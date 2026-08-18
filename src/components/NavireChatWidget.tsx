import { useState, type FormEvent } from "react";
import { Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { askCareAgent } from "@/lib/care-agent";

const welcomeMessage =
  "Bonjour, je suis Assistant Kivoir. Je peux vous aider à mieux comprendre votre orientation pour une douleur de hanche, genou, cheville ou pied.";

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

export function NavireChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: welcomeMessage },
  ]);
  const [isSending, setIsSending] = useState(false);

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
          text: "Je ne parviens pas à répondre pour le moment. Vous pouvez décrire votre situation à votre médecin.\n\n⚠️ Kivoir est un outil d'accompagnement au parcours de soin et ne remplace pas une consultation médicale.",
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
                <p className="text-xs text-primary-foreground/75">Orientation membre inférieur</p>
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
                <div className="flex w-full flex-col items-start gap-0">
                  <p
                    className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                      item.role === "user"
                        ? "self-end rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border border-border bg-card text-card-foreground"
                    }`}
                  >
                    {item.text}
                  </p>
                  {item.practitioners?.length ? (
                    <div className="mt-2 w-full max-w-[92%] space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Professionnels à Saint-Maur-des-Fossés</p>
                    {item.practitioners.map((practitioner) => (
                      <article key={`${practitioner.nom}-${practitioner.prenom}-${practitioner.adresse}`} className="rounded-xl border border-border bg-card p-3 text-xs text-card-foreground">
                        <p className="font-semibold">{practitioner.prenom} {practitioner.nom}</p>
                        <p className="mt-1 text-muted-foreground">{practitioner.specialite}</p>
                        <p className="mt-1">{practitioner.adresse}, {practitioner.codePostal} {practitioner.ville}</p>
                        {practitioner.telephone ? (
                          <a className="mt-1 inline-block font-medium text-primary underline-offset-2 hover:underline" href={`tel:${practitioner.telephone}`}>
                            {practitioner.telephone.replace(/(\d{2})(?=\d)/g, "$1 ")}
                          </a>
                        ) : null}
                        <p className="mt-1 text-muted-foreground">{practitioner.secteur}</p>
                      </article>
                    ))}
                    </div>
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
              Assistant Kivoir ne pose pas de diagnostic et ne remplace pas un professionnel de santé.
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
