import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/patient/recommandations/$recoId")({
  beforeLoad: ({ params, search }) => {
    throw redirect({ to: "/conseils", search: { ...(search as Record<string, unknown>), reco: params.recoId } as never });
  },
});
