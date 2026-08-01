"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { PhotowalkPin } from "@/lib/data";
import "leaflet/dist/leaflet.css";

const pinIcon = L.divIcon({
  className: "custom-pin",
  html: `<div style="
    width: 32px; height: 32px;
    background: #FFB800;
    border: 3px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

interface Props {
  center: [number, number];
  pins: PhotowalkPin[];
  onPinClick: (pin: PhotowalkPin) => void;
  selectedPinId?: string;
}

export function PhotowalkMapInner({ center, pins, onPinClick }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={15}
      className="w-full h-full z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapUpdater center={center} />
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          position={[pin.lat, pin.lng]}
          icon={pinIcon}
          eventHandlers={{
            click: () => onPinClick(pin),
          }}
        >
          <Popup>
            <strong>{pin.title}</strong>
            <br />
            {pin.photographer}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
