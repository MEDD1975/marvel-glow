const SENDER = "Kivoir <invitation@email.kivoir.fr>";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

function layout(title: string, paragraphs: string[], cta: { label: string; url: string }, footer: string) {
  const body = paragraphs.map((text) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155">${escapeHtml(text)}</p>`).join("");
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px">
<tr><td>
<p style="margin:0 0 24px;font-size:13px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;color:#0f766e">Kivoir</p>
<h1 style="margin:0 0 16px;font-size:22px;color:#0f172a">${escapeHtml(title)}</h1>
${body}
<p style="margin:24px 0"><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:10px">${escapeHtml(cta.label)}</a></p>
<p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#64748b">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
<p style="margin:0 0 24px;font-size:12px;word-break:break-all;color:#0f766e">${escapeHtml(cta.url)}</p>
<p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8">${escapeHtml(footer)}</p>
</td></tr></table></td></tr></table></body></html>`;
}

async function sendEmail(input: { to: string; subject: string; html: string; text: string }): Promise<{ id: string }> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ from: SENDER, to: [input.to], subject: input.subject, html: input.html, text: input.text }),
  });
  const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!response.ok || !payload.id) throw new Error(`Resend error ${response.status}: ${payload.message ?? "unknown"}`);
  return { id: payload.id };
}

/** greetingName provient des données professionnelles explicites ; aucun titre n'est ajouté automatiquement. */
export function sendDoctorInvitationEmail(input: { to: string; greetingName: string; activationUrl: string; expiresAt: Date }) {
  const expires = input.expiresAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
  const paragraphs = [
    `Bonjour ${input.greetingName},`,
    "L’équipe Kivoir vous invite à activer votre espace professionnel. Vous y retrouverez immédiatement les 10 parcours TMS, les QR codes associés à chaque parcours et les outils permettant de personnaliser votre espace professionnel.",
    "Pour des raisons de sécurité, ce lien est personnel, temporaire et utilisable une seule fois.",
    `Ce lien est valable jusqu’au ${expires}.`,
  ];
  const footer = "Vous n’attendiez pas cette invitation ? Ignorez simplement ce message : aucun compte ne sera créé.";
  return sendEmail({
    to: input.to,
    subject: "Activez votre espace professionnel Kivoir",
    html: layout("Votre espace professionnel Kivoir vous attend", paragraphs, { label: "Activer mon compte", url: input.activationUrl }, footer),
    text: `${paragraphs.join("\n\n")}\n\nActiver mon compte : ${input.activationUrl}\n\n${footer}`,
  });
}

export function sendPasswordResetEmail(input: { to: string; resetUrl: string }) {
  const paragraphs = [
    "Une demande de réinitialisation du mot de passe de votre espace professionnel Kivoir a été effectuée.",
    "Ce lien est valable une heure et ne peut être utilisé qu’une seule fois.",
  ];
  const footer = "Si vous n’êtes pas à l’origine de cette demande, ignorez ce message : votre mot de passe actuel reste inchangé.";
  return sendEmail({
    to: input.to,
    subject: "Réinitialisation de votre mot de passe Kivoir",
    html: layout("Choisir un nouveau mot de passe", paragraphs, { label: "Choisir un nouveau mot de passe", url: input.resetUrl }, footer),
    text: `${paragraphs.join("\n\n")}\n\n${input.resetUrl}\n\n${footer}`,
  });
}
