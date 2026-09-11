import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { auth } from "./lib/auth";
import { getDoctorNetwork, saveDoctorNetwork } from "./lib/doctor-network-db";
import { put } from "@vercel/blob";
import { createDoctorResource, deleteDoctorResource, listAllActiveDoctorResources, listDoctorResources } from "./lib/doctor-resource-db";

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
      if (url.pathname === "/api/doctor-file" && request.method === "POST") {
        try {
          const session = await auth.api.getSession({ headers: request.headers });
          if (!session?.user) return Response.json({ error: "Votre session médecin a expiré. Reconnectez-vous." }, { status: 401 });
          const formData = await request.formData();
          const file = formData.get("file");
          if (!file || typeof file !== "object" || !("size" in file) || !("name" in file) || !("type" in file)) return Response.json({ error: "Sélectionnez un fichier." }, { status: 400 });
          const uploadedFile = file as File;
          if (uploadedFile.size > 10 * 1024 * 1024) return Response.json({ error: "Le fichier ne doit pas dépasser 10 Mo." }, { status: 400 });
          const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "video/mp4", "video/quicktime"];
          if (!allowedTypes.includes(uploadedFile.type)) return Response.json({ error: "Formats acceptés : PDF, JPG, PNG, MP4 ou MOV." }, { status: 400 });
          const title = String(formData.get("title") ?? uploadedFile.name).trim();
          const conditionId = String(formData.get("conditionId") ?? "").trim();
          const source = String(formData.get("source") ?? "Fichier partagé par le médecin").trim();
          if (!title || !conditionId) return Response.json({ error: "Le titre et le trouble sont obligatoires." }, { status: 400 });
          const blob = await put(`doctor-resources/${session.user.id}/${Date.now()}-${uploadedFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`, uploadedFile, { access: "public", addRandomSuffix: true });
          const resource = await createDoctorResource(session.user.id, { title, conditionId, url: blob.url, filename: uploadedFile.name, contentType: uploadedFile.type, source });
          return Response.json(resource, { status: 201 });
        } catch (error) {
          console.error("[v0] doctor file upload failed", error);
          return Response.json({ error: "Le fichier n’a pas pu être enregistré. Réessayez." }, { status: 500 });
        }
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
            practitioners: practitioners.map((item: { name: string; profession: string; phone?: string; email?: string }) => ({ name: item.name.trim(), profession: item.profession.trim(), phone: item.phone?.trim(), email: item.email?.trim() })),
          }), { status: 201 });
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
