"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Abia State bus routes — real coordinates
const ROUTES = [
  {
    id: "umuahia-aba",
    name: "Umuahia → Aba",
    color: "#1A6B3C",
    coordinates: [
      [7.4921, 5.5248],  // Umuahia
      [7.4200, 5.3000],  // Midpoint
      [7.3663, 5.1069],  // Aba
    ],
  },
  {
    id: "umuahia-ohafia",
    name: "Umuahia → Ohafia",
    color: "#E8941A",
    coordinates: [
      [7.4921, 5.5248],  // Umuahia
      [7.7000, 5.6200],  // Midpoint
      [7.8271, 5.6258],  // Ohafia
    ],
  },
];

const BUS_POSITIONS = [
  { id: "BUS-04", lng: 7.4200, lat: 5.3000, route: "Umuahia → Aba" },
  { id: "BUS-11", lng: 7.6000, lat: 5.5800, route: "Umuahia → Ohafia" },
  { id: "BUS-07", lng: 7.4600, lat: 5.4200, route: "Umuahia → Aba" },
];

export default function TransportMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [7.4921, 5.5248], // Umuahia
      zoom: 9,
    });

    map.current.on("load", () => {
      if (!map.current) return;

      // Draw each route
      ROUTES.forEach((route) => {
        map.current!.addSource(route.id, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: route.coordinates,
            },
          },
        });

        map.current!.addLayer({
          id: route.id,
          type: "line",
          source: route.id,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": route.color,
            "line-width": 3,
            "line-opacity": 0.85,
          },
        });
      });

      // Add bus markers
      BUS_POSITIONS.forEach((bus) => {
        const el = document.createElement("div");
        el.style.cssText = `
          width: 32px; height: 32px; border-radius: 50%;
          background: #0F3D22; border: 2.5px solid #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        el.innerHTML = "🚌";

        new mapboxgl.Marker({ element: el })
          .setLngLat([bus.lng, bus.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 20 }).setHTML(`
              <div style="font-family: monospace; font-size: 12px; padding: 4px;">
                <strong>${bus.id}</strong><br/>
                ${bus.route}
              </div>
            `)
          )
          .addTo(map.current!);
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
    />
  );
}