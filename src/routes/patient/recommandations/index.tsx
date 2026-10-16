import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/patient/recommandations/")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/conseils", search: search as never });
  },
});
