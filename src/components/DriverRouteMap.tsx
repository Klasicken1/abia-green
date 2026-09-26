"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ROUTES as LINE_ROUTES } from "@/components/TransportMap";
import { ROUTES as ROUTE_INFO } from "@/lib/routesData";

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

// Parses labels like "Departure", "~15 min", "~2 hrs" into minutes, so a
// stop's rough position along the route can be estimated proportionally.
// This is an approximation until stops are individually geo-surveyed —
// good enough to orient a driver, not a precision GPS fix.
function parseMinutesLabel(label: string): number {
  if (/departure/i.test(label)) return 0;
  const hrMatch = label.match(/(\d+(?:\.\d+)?)\s*hr/i);
  if (hrMatch) return parseFloat(hrMatch[1]) * 60;
  const minMatch = label.match(/(\d+)/);
  return minMatch ? parseInt(minMatch[1], 10) : 0;
}

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

function createStopMarkerElement(name: string): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `
    width: 14px; height: 14px; border-radius: 50%;
    background: #fff; border: 3px solid #1A6B3C;
    box-shadow: 0 1px 4px rgba(0,0,0,0.25);
  `;
  el.title = name;
  return el;
}

export default function DriverRouteMap({ routeId, progress }: DriverRouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const lineRoute = LINE_ROUTES.find(r => r.id === routeId);
  const routeInfo = ROUTE_INFO[routeId];
  const cityCenter = CITY_CENTERS[routeId];

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const initialCenter = lineRoute
      ? lineRoute.coordinates[0]
      : cityCenter ?? [7.4921, 5.5248];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: initialCenter as [number, number],
      zoom: lineRoute ? 10 : 12,
    });

    map.current.on("load", () => {
      if (!map.current) return;

      if (lineRoute) {
        map.current.addSource("driver-route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: lineRoute.coordinates },
          },
        });
        map.current.addLayer({
          id: "driver-route-line",
          type: "line",
          source: "driver-route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": lineRoute.color, "line-width": 5, "line-opacity": 0.9 },
        });

        const bounds = lineRoute.coordinates.reduce(
          (b, coord) => b.extend(coord as [number, number]),
          new mapboxgl.LngLatBounds(
            lineRoute.coordinates[0] as [number, number],
            lineRoute.coordinates[0] as [number, number]
          )
        );
        map.current.fitBounds(bounds, { padding: 60 });

        // Checkpoint / stop markers — positioned proportionally along the
        // route line based on each stop's rough time-from-departure.
        if (routeInfo) {
          const totalMinutes = parseMinutesLabel(routeInfo.duration);
          routeInfo.stops.forEach(stop => {
            const fraction = totalMinutes > 0 ? parseMinutesLabel(stop.time) / totalMinutes : 0;
            const pos = pointAtFraction(lineRoute.coordinates, fraction);
            new mapboxgl.Marker({ element: createStopMarkerElement(stop.name) })
              .setLngLat(pos)
              .setPopup(
                new mapboxgl.Popup({ offset: 14 }).setHTML(
                  `<div style="font-family: monospace; font-size: 11px; padding: 2px;">${stop.name}</div>`
                )
              )
              .addTo(map.current!);
          });
        }
      }

      const el = createBusMarkerElement();
      const startPos = lineRoute
        ? pointAtFraction(lineRoute.coordinates, progress / 100)
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
    if (!marker.current || !lineRoute) return;
    const pos = pointAtFraction(lineRoute.coordinates, progress / 100);
    marker.current.setLngLat(pos);
  }, [progress, lineRoute]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      {!lineRoute && (
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