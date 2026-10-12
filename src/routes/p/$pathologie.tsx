import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { conditions } from "@/lib/conditions";
import { ParcoursPageContent } from "@/components/ParcoursPageContent";

export const Route = createFileRoute("/p/$pathologie")({
  component: PublicPathwayPage,
});

function PublicPathwayPage() {
  const { pathologie } = Route.useParams();
  const search = Route.useSearch() as { ref?: string };
  const condition = conditions.find((item) => item.id === pathologie);

  useEffect(() => {
    if (!condition || !search.ref) return;
    void fetch("/api/scans", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ medecinId: search.ref, parcoursId: pathologie }),
      keepalive: true,
    }).catch(() => undefined);
  }, [condition, pathologie, search.ref]);

  return <ParcoursPageContent pathway={pathologie} />;
}
