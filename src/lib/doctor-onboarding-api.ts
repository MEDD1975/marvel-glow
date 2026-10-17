import { auth, MIN_PASSWORD_LENGTH } from "./auth";
import {
  attachInvitationUser,
  cancelInvitation,
  claimInvitation,
  createInvitation,
  emailHasAccount,
  findValidInvitation,
  isActiveAdmin,
  listDoctors,
  listInvitations,
  markInvitationSent,
  releaseInvitation,
  renewInvitationToken,
  setDoctorDisabled,
  signCabinetRef,
  type InvitationInput,
} from "./doctor-account-db";
import { saveDoctorNetwork } from "./doctor-network-db";
import { sendDoctorInvitationEmail } from "./kivoir-email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function parseInvitationInput(payload: Record<string, unknown>): { value: InvitationInput } | { error: string } {
  const email = text(payload["email"], 254)?.toLowerCase() ?? "";
  const firstName = text(payload["firstName"], 80);
  const lastName = text(payload["lastName"], 80);
  if (!EMAIL_PATTERN.test(email)) return { error: "Adresse e-mail invalide." };
  if (!firstName || !lastName) return { error: "Le prénom et le nom du médecin sont obligatoires." };
  const postalCode = text(payload["postalCode"], 10);
  if (postalCode && !/^\d{5}$/.test(postalCode)) return { error: "Le code postal doit contenir 5 chiffres." };
  return {
    value: {
      email,
      firstName,
      lastName,
      cabinetName: text(payload["cabinetName"], 160),
      phone: text(payload["phone"], 30),
      address: text(payload["address"], 200),
      postalCode,
      city: text(payload["city"], 100),
    },
  };
}

function activationUrl(origin: string, token: string) {
  return `${origin}/activation-medecin?token=${encodeURIComponent(token)}`;
}

async function sendInvitation(origin: string, invitation: { id: string; email: string; firstName: string }, token: string, expiresAt: Date) {
  try {
    const sent = await sendDoctorInvitationEmail({ to: invitation.email, firstName: invitation.firstName, activationUrl: activationUrl(origin, token), expiresAt });
    await markInvitationSent(invitation.id, sent.id);
    return true;
  } catch (error) {
    console.error("[kivoir] invitation email failed", error);
    return false;
  }
}

async function requireAdmin(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user || !(await isActiveAdmin(session.user.id))) return null;
  return session.user;
}

async function handleAdminDoctors(request: Request, url: URL): Promise<Response> {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: "Accès réservé à l’administration Kivoir." }, { status: 403 });

  if (request.method === "GET") {
    const [doctors, invitations] = await Promise.all([listDoctors(), listInvitations()]);
    return Response.json({ doctors, invitations });
  }

  if (request.method === "POST") {
    const parsed = parseInvitationInput((await request.json().catch(() => ({}))) as Record<string, unknown>);
    if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });
    if (await emailHasAccount(parsed.value.email)) return Response.json({ error: "Un compte Kivoir existe déjà pour cette adresse." }, { status: 409 });
    const created = await createInvitation(parsed.value, admin.id);
    const sent = await sendInvitation(url.origin, { id: created.id, ...parsed.value }, created.token, created.expiresAt);
    if (!sent) return Response.json({ error: "Invitation enregistrée, mais l’e-mail n’a pas pu être envoyé. Utilisez « Renvoyer »." }, { status: 502 });
    return Response.json({ ok: true }, { status: 201 });
  }

  if (request.method === "PATCH") {
    const payload = (await request.json().catch(() => ({}))) as { action?: unknown; id?: unknown };
    const id = text(payload.id, 200);
    if (!id) return Response.json({ error: "Élément introuvable." }, { status: 400 });
    switch (payload.action) {
      case "resend": {
        const renewed = await renewInvitationToken(id);
        if (!renewed) return Response.json({ error: "Cette invitation n’est plus en attente." }, { status: 404 });
        const sent = await sendInvitation(url.origin, renewed.invitation, renewed.token, renewed.expiresAt);
        return sent ? Response.json({ ok: true }) : Response.json({ error: "L’e-mail n’a pas pu être envoyé. Réessayez." }, { status: 502 });
      }
      case "cancel":
        return (await cancelInvitation(id)) ? Response.json({ ok: true }) : Response.json({ error: "Cette invitation n’est plus en attente." }, { status: 404 });
      case "disable":
      case "enable":
        return (await setDoctorDisabled(id, payload.action === "disable"))
          ? Response.json({ ok: true })
          : Response.json({ error: "Médecin introuvable." }, { status: 404 });
      default:
        return Response.json({ error: "Action inconnue." }, { status: 400 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}

function composeAddress(invitation: { address: string | null; postalCode: string | null; city: string | null }) {
  const locality = [invitation.postalCode, invitation.city].filter(Boolean).join(" ");
  return [invitation.address, locality].filter(Boolean).join(", ");
}

async function handleActivation(request: Request, url: URL): Promise<Response> {
  if (request.method === "GET") {
    const token = url.searchParams.get("token") ?? "";
    const invitation = token ? await findValidInvitation(token) : null;
    if (!invitation) return Response.json({ error: "Ce lien d’activation est invalide, expiré ou déjà utilisé." }, { status: 404 });
    return Response.json({ email: invitation.email, firstName: invitation.firstName, lastName: invitation.lastName, cabinetName: invitation.cabinetName });
  }

  if (request.method === "POST") {
    const payload = (await request.json().catch(() => ({}))) as { token?: unknown; password?: unknown };
    const token = typeof payload.token === "string" ? payload.token : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    if (password.length < MIN_PASSWORD_LENGTH || password.length > 128) {
      return Response.json({ error: `Le mot de passe doit contenir entre ${MIN_PASSWORD_LENGTH} et 128 caractères.` }, { status: 400 });
    }
    const invitation = token ? await claimInvitation(token) : null;
    if (!invitation) return Response.json({ error: "Ce lien d’activation est invalide, expiré ou déjà utilisé." }, { status: 404 });

    let userId: string | null = null;
    try {
      if (await emailHasAccount(invitation.email)) {
        await releaseInvitation(invitation.id);
        return Response.json({ error: "Un compte existe déjà pour cette adresse. Connectez-vous ou utilisez « Mot de passe oublié »." }, { status: 409 });
      }
      const context = await auth.$context;
      const user = await context.internalAdapter.createUser({
        email: invitation.email,
        name: `${invitation.firstName} ${invitation.lastName}`,
        emailVerified: true,
      }, { method: "admin" });
      userId = user.id;
      await context.internalAdapter.linkAccount({
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: await context.password.hash(password),
      });
      await attachInvitationUser(invitation.id, user.id);
      await saveDoctorNetwork(user.id, {
        name: invitation.cabinetName ?? `Cabinet du Dr ${invitation.lastName}`,
        address: composeAddress(invitation),
        phone: invitation.phone,
        practitioners: [],
      });
      return Response.json({ ok: true, email: invitation.email }, { status: 201 });
    } catch (error) {
      console.error("[kivoir] doctor activation failed", error);
      if (!userId) await releaseInvitation(invitation.id);
      return Response.json({ error: "L’activation n’a pas pu aboutir. Réessayez ou contactez Kivoir." }, { status: 500 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}

async function handleCabinetRef(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await isActiveAdmin(session.user.id);
  return Response.json({ ref: signCabinetRef(session.user.id), admin });
}

/** Routes d'invitation, d'activation et d'identification du cabinet. Retourne null si non concerné. */
export async function handleOnboardingRequest(request: Request, url: URL): Promise<Response | null> {
  if (url.pathname === "/api/admin/doctors") return handleAdminDoctors(request, url);
  if (url.pathname === "/api/doctor-activation") return handleActivation(request, url);
  if (url.pathname === "/api/doctor-cabinet-ref" && request.method === "GET") return handleCabinetRef(request);
  return null;
}
