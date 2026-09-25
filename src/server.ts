import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { auth } from "./lib/auth";
import { deleteDoctorPractitioner, getDoctorNetwork, getPublicDoctorNetworks, saveDoctorNetwork, updateDoctorPractitioner } from "./lib/doctor-network-db";
import { put } from "@vercel/blob";
import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { createDoctorResource, deleteDoctorResource, listAllActiveDoctorResources, listDoctorResources } from "./lib/doctor-resource-db";
import { createFollowUpStep, deleteFollowUpStep, listFollowUpSteps, reorderFollowUpSteps, updateFollowUpStep, type FollowUpAnswer, type FollowUpStepInput } from "./lib/follow-up-db";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// Validates a doctor-authored follow-up step. All medical wording comes from the
// doctor: nothing is defaulted or pre-filled here.
function parseFollowUpStepInput(payload: Record<string, unknown>): { value: FollowUpStepInput } | { error: string } {
  const rawTitle = payload["title"];
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  if (!title) return { error: "Le titre de l’étape est obligatoire." };
  const rawInstruction = payload["instruction"];
  const instruction = typeof rawInstruction === "string" ? rawInstruction.trim() : "";
  const rawDelay = payload["delayText"];
  const delayText = typeof rawDelay === "string" && rawDelay.trim() ? rawDelay.trim() : null;
  const rawQuestion = payload["question"];
  const question = typeof rawQuestion === "string" && rawQuestion.trim() ? rawQuestion.trim() : null;

  let answers: FollowUpAnswer[] = [];
  if (question) {
    const rawAnswers = Array.isArray(payload["answers"]) ? (payload["answers"] as unknown[]) : [];
    answers = rawAnswers
      .map((item): FollowUpAnswer | null => {
        if (!item || typeof item !== "object") return null;
        const entry = item as Record<string, unknown>;
        const rawLabel = entry["label"];
        const label = typeof rawLabel === "string" ? rawLabel.trim() : "";
        if (!label) return null;
        const action = entry["action"] === "redirect" ? "redirect" : "continue";
        const rawRedirect = entry["redirectMessage"];
        const redirectMessage = action === "redirect" && typeof rawRedirect === "string" && rawRedirect.trim() ? rawRedirect.trim() : null;
        const rawId = entry["id"];
        return { id: typeof rawId === "string" && rawId ? rawId : `answer_${crypto.randomUUID()}`, label, action, redirectMessage };
      })
      .filter((item): item is FollowUpAnswer => item !== null)
      .slice(0, 3);
    if (answers.length < 2) return { error: "Une question de contrôle doit proposer 2 ou 3 réponses." };
  }

  return { value: { title, instruction, delayText, question, answers } };
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/auth/")) {
        return await auth.handler(request);
      }
      if (url.pathname === "/api/doctor-resources") {
        const conditionId = url.searchParams.get("conditionId") ?? undefined;
        const session = await auth.api.getSession({ headers: request.headers });
        if (request.method === "GET") {
          return Response.json(session?.user ? await listDoctorResources(session.user.id, conditionId) : await listAllActiveDoctorResources(conditionId));
        }
        if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        if (request.method === "POST") {
          const payload = await request.json();
          if (!payload || typeof payload.title !== "string" || typeof payload.conditionId !== "string" || typeof payload.url !== "string") return Response.json({ error: "Informations invalides" }, { status: 400 });
          return Response.json(await createDoctorResource(session.user.id, { title: payload.title.trim(), conditionId: payload.conditionId, url: payload.url, filename: typeof payload.filename === "string" ? payload.filename : undefined, contentType: typeof payload.contentType === "string" ? payload.contentType : undefined, source: typeof payload.source === "string" ? payload.source.trim() : undefined }), { status: 201 });
        }
        if (request.method === "DELETE") {
          const payload = await request.json() as { id?: string };
          if (!payload.id) return Response.json({ error: "Fichier introuvable" }, { status: 400 });
          await deleteDoctorResource(session.user.id, payload.id);
          return Response.json({ ok: true });
        }
        return new Response("Method Not Allowed", { status: 405 });
      }
      if (url.pathname === "/api/doctor-file-token" && request.method === "POST") {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) return Response.json({ error: "Votre session médecin a expiré. Reconnectez-vous." }, { status: 401 });
        const payload = await request.json() as { filename?: string; contentType?: string };
        const filename = typeof payload.filename === "string" ? payload.filename.replace(/[^a-zA-Z0-9._-]/g, "-") : "resource.bin";
        const pathname = `doctor-resources/${session.user.id}/${Date.now()}-${filename}`;
        const token = await generateClientTokenFromReadWriteToken({
          pathname,
          maximumSizeInBytes: 50 * 1024 * 1024,
          allowedContentTypes: ["image/*", "video/*", "application/pdf"],
          addRandomSuffix: true,
        });
        return Response.json({ token, pathname });
      }
      if (url.pathname === "/api/doctor-file" && request.method === "POST") {
        try {
          const session = await auth.api.getSession({ headers: request.headers });
          if (!session?.user) return Response.json({ error: "Votre session médecin a expiré. Reconnectez-vous." }, { status: 401 });
          const formData = await request.formData();
          const file = formData.get("file");
          if (!file || typeof file !== "object" || !("size" in file) || !("name" in file) || !("type" in file)) return Response.json({ error: "Sélectionnez un fichier." }, { status: 400 });
          const uploadedFile = file as File;
          if (uploadedFile.size === 0) return Response.json({ error: "Le fichier sélectionné est vide." }, { status: 400 });
          if (uploadedFile.size > 50 * 1024 * 1024) return Response.json({ error: "Le fichier ne doit pas dépasser 50 Mo." }, { status: 400 });
          const extension = uploadedFile.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";
          const extensionToType: Record<string, string> = {
            pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
            heic: "image/heic", heif: "image/heif", webp: "image/webp",
            mp4: "video/mp4", mov: "video/quicktime", m4v: "video/x-m4v",
          };
          const resolvedType = uploadedFile.type || extensionToType[extension] || "";
          const allowedExtensions = Object.keys(extensionToType);
          if (!allowedExtensions.includes(extension) && !Object.values(extensionToType).includes(resolvedType)) {
            return Response.json({ error: "Formats acceptés : PDF, JPG, PNG, HEIC, WEBP, MP4 ou MOV." }, { status: 400 });
          }
          const title = String(formData.get("title") ?? uploadedFile.name).trim() || uploadedFile.name;
          const conditionId = String(formData.get("conditionId") ?? "").trim();
          if (!conditionId) return Response.json({ error: "Choisissez un trouble ou parcours." }, { status: 400 });
          const source = String(formData.get("source") ?? "Fichier partagé par le médecin").trim();
          const blob = await put(`doctor-resources/${session.user.id}/${Date.now()}-${uploadedFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`, uploadedFile, { access: "public", addRandomSuffix: true });
          const resource = await createDoctorResource(session.user.id, { title, conditionId, url: blob.url, filename: uploadedFile.name, contentType: resolvedType || "application/octet-stream", source });
          return Response.json(resource, { status: 201 });
        } catch (error) {
          console.error("[v0] doctor file upload failed", error);
          return Response.json({ error: "Le fichier n’a pas pu être enregistré. Réessayez." }, { status: 500 });
        }
      }
      if (url.pathname === "/api/follow-up-steps") {
        const conditionId = url.searchParams.get("conditionId") ?? undefined;
        const session = await auth.api.getSession({ headers: request.headers });
        if (request.method === "GET") {
          return Response.json(session?.user ? await listFollowUpSteps(session.user.id, conditionId) : await listFollowUpSteps(undefined, conditionId));
        }
        if (!session?.user) return Response.json({ error: "Votre session médecin a expiré. Reconnectez-vous." }, { status: 401 });
        if (request.method === "POST") {
          const payload = await request.json() as { conditionId?: unknown; reorder?: unknown } & Record<string, unknown>;
          if (Array.isArray(payload.reorder)) {
            if (typeof payload.conditionId !== "string" || !payload.conditionId.trim()) return Response.json({ error: "Trouble manquant." }, { status: 400 });
            const orderedIds = payload.reorder.filter((item): item is string => typeof item === "string");
            return Response.json(await reorderFollowUpSteps(session.user.id, payload.conditionId, orderedIds));
          }
          if (typeof payload.conditionId !== "string" || !payload.conditionId.trim()) return Response.json({ error: "Choisissez un trouble." }, { status: 400 });
          const parsed = parseFollowUpStepInput(payload);
          if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });
          return Response.json(await createFollowUpStep(session.user.id, payload.conditionId, parsed.value), { status: 201 });
        }
        if (request.method === "PATCH") {
          const payload = await request.json() as { id?: unknown } & Record<string, unknown>;
          if (typeof payload.id !== "string" || !payload.id) return Response.json({ error: "Étape introuvable." }, { status: 400 });
          const parsed = parseFollowUpStepInput(payload);
          if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });
          const updated = await updateFollowUpStep(session.user.id, payload.id, parsed.value);
          if (!updated) return Response.json({ error: "Étape introuvable." }, { status: 404 });
          return Response.json(updated);
        }
        if (request.method === "DELETE") {
          const payload = await request.json() as { id?: string };
          if (!payload.id) return Response.json({ error: "Étape introuvable." }, { status: 400 });
          await deleteFollowUpStep(session.user.id, payload.id);
          return Response.json({ ok: true });
        }
        return new Response("Method Not Allowed", { status: 405 });
      }
      if (url.pathname === "/api/public-networks" && request.method === "GET") {
        const networks = await getPublicDoctorNetworks();
        const requestedId = url.searchParams.get("id");
        return Response.json(requestedId ? networks.filter((network) => network.id === requestedId) : networks);
      }
      if (url.pathname === "/api/doctor-network") {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        if (request.method === "GET") return Response.json(await getDoctorNetwork(session.user.id));
        if (request.method === "POST") {
          const payload = await request.json();
          if (!payload || typeof payload.name !== "string" || typeof payload.address !== "string" || !Array.isArray(payload.practitioners)) {
            return Response.json({ error: "Informations invalides" }, { status: 400 });
          }
          const practitioners = payload.practitioners.filter((item: unknown) => item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string" && typeof (item as { profession?: unknown }).profession === "string");
          if (!practitioners.length) return Response.json({ error: "Ajoutez au moins un praticien" }, { status: 400 });
          return Response.json(await saveDoctorNetwork(session.user.id, {
            name: payload.name.trim(),
            address: payload.address.trim(),
            phone: typeof payload.phone === "string" ? payload.phone.trim() : undefined,
            practitioners: practitioners.map((item: { name: string; profession: string; phone?: string; email?: string; address?: string; postalCode?: string; city?: string }) => ({ name: item.name.trim(), profession: item.profession.trim(), phone: item.phone?.trim(), email: item.email?.trim(), address: item.address?.trim(), postalCode: item.postalCode?.trim(), city: item.city?.trim() })),
          }), { status: 201 });
        }
        if (request.method === "PATCH") {
          const payload = await request.json() as { id?: string; name?: string; profession?: string; phone?: string; email?: string; address?: string; postalCode?: string; city?: string };
          if (!payload.id || !payload.name?.trim() || !payload.profession?.trim()) {
            return Response.json({ error: "Le nom et la spécialité sont obligatoires." }, { status: 400 });
          }
          return Response.json(await updateDoctorPractitioner(session.user.id, {
            id: payload.id,
            name: payload.name.trim(),
            profession: payload.profession.trim(),
            phone: payload.phone?.trim(),
            email: payload.email?.trim(),
            address: payload.address?.trim(),
            postalCode: payload.postalCode?.trim(),
            city: payload.city?.trim(),
          }));
        }
        if (request.method === "DELETE") {
          const payload = await request.json() as { practitionerId?: string };
          if (!payload.practitionerId) return Response.json({ error: "Professionnel introuvable" }, { status: 400 });
          return Response.json(await deleteDoctorPractitioner(session.user.id, payload.practitionerId));
        }
        return new Response("Method Not Allowed", { status: 405 });
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
