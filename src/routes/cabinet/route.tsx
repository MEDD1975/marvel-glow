import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { DoctorLayout } from "@/components/doctor/DoctorLayout";

export const Route = createFileRoute("/cabinet")({
  component: CabinetLayout,
});

function CabinetLayout() {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      void navigate({ to: "/connexion-medecin" });
    }
  }, [isPending, navigate, session?.user]);

  if (pathname.startsWith("/cabinet/accueil")) return <Outlet />;

  if (isPending || !session?.user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p role="status" className="text-center text-sm text-muted-foreground">Vérification de votre session…</p>
      </main>
    );
  }

  return (
    <DoctorLayout>
      <Outlet />
    </DoctorLayout>
  );
}
