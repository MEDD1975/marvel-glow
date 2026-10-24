import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { conditions } from "@/lib/conditions";
import { ParcoursPageContent } from "@/components/ParcoursPageContent";
import { ExpiredQrNotice } from "@/components/patient/ExpiredQrNotice";
import { isExpiredLegacyQr, isExpiredSignedCabinetRef } from "@/lib/legacy-qr";

export const Route = createFileRoute("/p/$pathologie")({
  component: PublicPathwayPage,
});

function PublicPathwayPage() {
  const { pathologie } = Route.useParams();
  const search = Route.useSearch() as { ref?: string; medecin_id?: string };
  const condition = conditions.find((item) => item.id === pathologie);
  const medecinId = search.ref?.trim() || search.medecin_id?.trim();
  const expired = isExpiredLegacyQr(medecinId) || isExpiredSignedCabinetRef(medecinId);

  useEffect(() => {
    if (!condition || !medecinId || expired) return;
    void fetch("/api/scans", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ medecinId, parcoursId: pathologie }),
      keepalive: true,
    }).catch(() => undefined);
  }, [condition, medecinId, pathologie, expired]);

  if (expired) return <ExpiredQrNotice />;
  if (!condition) return <ParcoursPageContent pathway={pathologie} />;
  return (
    <Navigate
      to="/patient"
      replace
      search={{ pathway: pathologie, ...(medecinId ? { ref: medecinId } : {}) } as never}
    />
  );
}
