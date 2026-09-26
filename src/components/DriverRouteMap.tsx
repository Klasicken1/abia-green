"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ROUTES } from "@/components/TransportMap";

interface DriverRouteMapProps {
  routeId: string;
  progress: number; // 0-100
}

function pointAtFraction(coords: number[][], fraction: number): [number, number] {
  if (coords.length === 1) return [coords[0][0], coords[0][1]];

  const segmentLengths: number[] = [];
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[i + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    segmentLengths.push(len);
    total += len;
  }

  let target = Math.max(0, Math.min(1, fraction)) * total;
  for (let i = 0; i < segmentLengths.length; i++) {
    if (target <= segmentLengths[i] || i === segmentLengths.length - 1) {
      const segFraction = segmentLengths[i] === 0 ? 0 : target / segmentLengths[i];
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[i + 1];
      return [x1 + (x2 - x1) * segFraction, y1 + (y2 - y1) * segFraction];
    }
    target -= segmentLengths[i];
  }
  return [coords[coords.length - 1][0], coords[coords.length - 1][1]];
}

// City-route fallback centers — no line data exists yet for these routes,
// so we show a centered city map instead of fabricating a path.
const CITY_CENTERS: Record<string, [number, number]> = {
  "intra-aba": [7.3663, 5.1069],
  "intra-umuahia": [7.4921, 5.5248],
};

function createBusMarkerElement(): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    position: relative;
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
  `;

  const ring = document.createElement("div");
  ring.style.cssText = `
    position: absolute;
    width: 40px; height: 40px;
    border-radius: 50%;
    background: #1A6B3C;
    animation: busPulse 2s ease-out infinite;
  `;

  const icon = document.createElement("div");
  icon.style.cssText = `
    position: relative;
    width: 40px; height: 40px; border-radius: 50%;
    background: #0F3D22; border: 3px solid #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: 0 3px 12px rgba(0,0,0,0.35);
  `;
  icon.innerHTML = "🚌";

  wrapper.appendChild(ring);
  wrapper.appendChild(icon);
  return wrapper;
}

export default function DriverRouteMap({ routeId, progress }: DriverRouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const routeInfo = ROUTES.find(r => r.id === routeId);
  const cityCenter = CITY_CENTERS[routeId];

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const initialCenter = routeInfo
      ? routeInfo.coordinates[0]
      : cityCenter ?? [7.4921, 5.5248];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: initialCenter as [number, number],
      zoom: routeInfo ? 10 : 12,
    });

    map.current.on("load", () => {
      if (!map.current) return;

      if (routeInfo) {
        map.current.addSource("driver-route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: routeInfo.coordinates },
          },
        });
        map.current.addLayer({
          id: "driver-route-line",
          type: "line",
          source: "driver-route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": routeInfo.color, "line-width": 5, "line-opacity": 0.9 },
        });

        const bounds = routeInfo.coordinates.reduce(
          (b, coord) => b.extend(coord as [number, number]),
          new mapboxgl.LngLatBounds(
            routeInfo.coordinates[0] as [number, number],
            routeInfo.coordinates[0] as [number, number]
          )
        );
        map.current.fitBounds(bounds, { padding: 60 });
      }

      const el = createBusMarkerElement();

      const startPos = routeInfo
        ? pointAtFraction(routeInfo.coordinates, progress / 100)
        : (cityCenter as [number, number]);

      marker.current = new mapboxgl.Marker({ element: el }).setLngLat(startPos).addTo(map.current);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  useEffect(() => {
    if (!marker.current || !routeInfo) return;
    const pos = pointAtFraction(routeInfo.coordinates, progress / 100);
    marker.current.setLngLat(pos);
  }, [progress, routeInfo]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      {!routeInfo && (
        <div className="absolute bottom-4 left-4 right-4 rounded-xl px-3 py-2"
          style={{ background: "rgba(15,61,34,0.9)", backdropFilter: "blur(4px)" }}>
          <p className="text-xs text-center" style={{ color: "rgba(253,250,245,0.85)" }}>
            Live position tracking for this city route arrives with GPS hardware integration.
          </p>
        </div>
      )}
    </div>
  );
}