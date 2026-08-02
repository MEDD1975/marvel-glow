import { useEffect, useRef } from "react";
import type { Provider } from "@/lib/directory";
import { cityCenter, professionColor } from "@/lib/directory";

/**
 * Carte Leaflet (OpenStreetMap) — rendue uniquement côté navigateur.
 * Leaflet est importé dynamiquement pour ne jamais être évalué pendant le SSR.
 */
export function ProviderMap({
  providers,
  activeId,
  onSelect,
}: {
  providers: Provider[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Record<string, any>>({});
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [cityCenter.lat, cityCenter.lng],
        zoom: 13,
        scrollWheelZoom: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;

      cleanup = () => {
        map.remove();
        mapRef.current = null;
        markersRef.current = {};
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      const map = mapRef.current;
      if (cancelled || !map) return;

      Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
      markersRef.current = {};

      providers.forEach((provider) => {
        const color = professionColor[provider.profession];
        const active = provider.id === activeId;
        const icon = L.divIcon({
          className: "",
          html: `<span style="display:block;width:${active ? 22 : 16}px;height:${
            active ? 22 : 16
          }px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.35)"></span>`,
          iconSize: [active ? 22 : 16, active ? 22 : 16],
          iconAnchor: [active ? 11 : 8, active ? 11 : 8],
        });
        const marker = L.marker([provider.lat, provider.lng], { icon })
          .addTo(map)
          .bindTooltip(`${provider.name} — ${provider.profession}`, { direction: "top" })
          .on("click", () => selectRef.current(provider.id));
        markersRef.current[provider.id] = marker;
      });

      if (providers.length > 0) {
        const bounds = L.latLngBounds(providers.map((p) => [p.lat, p.lng] as [number, number]));
        map.fitBounds(bounds.pad(0.25), { animate: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [providers, activeId]);

  useEffect(() => {
    const map = mapRef.current;
    const provider = providers.find((p) => p.id === activeId);
    if (map && provider) {
      map.setView([provider.lat, provider.lng], Math.max(map.getZoom(), 15), { animate: true });
      markersRef.current[provider.id]?.openTooltip?.();
    }
  }, [activeId, providers]);

  return <div ref={containerRef} className="h-[320px] w-full md:h-[460px]" />;
}

export default ProviderMap;
