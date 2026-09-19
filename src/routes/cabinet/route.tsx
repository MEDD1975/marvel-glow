import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/cabinet")({
  component: CabinetLayout,
});

function CabinetLayout() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      void navigate({ to: "/connexion-medecin" });
    }
  }, [isPending, navigate, session?.user]);

  return <Outlet />;
}
