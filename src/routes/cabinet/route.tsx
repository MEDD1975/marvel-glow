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
  const currentUser = session?.user as { role?: string; profession?: string } | undefined;
  const role = currentUser?.role;
  const isKine =
    role === "kine" ||
    role === "kinesitherapeute" ||
    currentUser?.profession === "kinesitherapeute";
  const isAdmin = role === "admin_kivoir";
  const isKinePath = pathname.startsWith("/cabinet/kine");

  useEffect(() => {
    if (isPending || !session?.user) {
      if (!isPending && !session?.user && pathname.startsWith("/cabinet")) {
        void navigate({ to: isKinePath ? "/connexion-kine" : "/connexion-medecin" });
      }
      return;
    }
    if (isKine && !isKinePath) void navigate({ to: "/cabinet/kine" });
    if (!isKine && !isAdmin && isKinePath) void navigate({ to: "/cabinet" });
  }, [isAdmin, isKine, isKinePath, isPending, navigate, pathname, session?.user]);

  if (pathname.startsWith("/cabinet/accueil")) return <Outlet />;

  if (isPending || !session?.user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p role="status" className="text-center text-sm text-muted-foreground">
          Vérification de votre session…
        </p>
      </main>
    );
  }

  if (isKinePath) return <Outlet />;

  return (
    <DoctorLayout>
      <Outlet />
    </DoctorLayout>
  );
}
