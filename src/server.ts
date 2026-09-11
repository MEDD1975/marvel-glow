import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { auth } from "./lib/auth";
import { getDoctorNetwork, saveDoctorNetwork } from "./lib/doctor-network-db";

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
