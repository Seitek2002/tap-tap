import "leaflet/dist/leaflet.css";

import * as L from "leaflet";
import { useEffect, useRef } from "react";

type RadiusMapProps = {
  className?: string;
  lat: number;
  lng: number;
  radiusKm: number;
};

const ACCENT = "#7c3aed";

/**
 * Лёгкая карта на Leaflet (OSM-тайлы, без ключа) с кругом выбранного радиуса.
 * Карта статична (жесты выключены) и всегда подгоняет масштаб под круг.
 */
export const RadiusMap = ({ className, lat, lng, radiusKm }: RadiusMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map = mapRef.current;
    let circle = circleRef.current;
    let marker = markerRef.current;

    if (!map) {
      map = L.map(container, {
        attributionControl: false,
        boxZoom: false,
        doubleClickZoom: false,
        dragging: false,
        keyboard: false,
        scrollWheelZoom: false,
        touchZoom: false,
        zoomControl: false,
      });
      // view нужно задать до работы с проекцией (иначе getBounds/fitBounds падают)
      map.setView([lat, lng], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);
      circle = L.circle([lat, lng], {
        color: ACCENT,
        fillColor: ACCENT,
        fillOpacity: 0.2,
        radius: radiusKm * 1000,
        weight: 2,
      }).addTo(map);
      // Маркер «ты здесь» в центре круга.
      marker = L.circleMarker([lat, lng], {
        color: "#fff",
        fillColor: ACCENT,
        fillOpacity: 1,
        radius: 6,
        weight: 2,
      }).addTo(map);
      mapRef.current = map;
      circleRef.current = circle;
      markerRef.current = marker;
    } else {
      circle?.setLatLng([lat, lng]);
      circle?.setRadius(radiusKm * 1000);
      marker?.setLatLng([lat, lng]);
    }

    map.invalidateSize();
    // Границы считаем от точки (не через circle.getBounds) — не зависит от
    // текущего состояния карты и надёжно охватывает круг радиуса radiusKm.
    map.fitBounds(L.latLng(lat, lng).toBounds(radiusKm * 2000), {
      padding: [12, 12],
    });
  }, [lat, lng, radiusKm]);

  // Очистка карты при размонтировании.
  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
      circleRef.current = null;
      markerRef.current = null;
    },
    [],
  );

  return <div ref={containerRef} className={className} />;
};
