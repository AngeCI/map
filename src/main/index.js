"use strict";

// Base map source definitions
const baseMaps = {
  "OpenStreetMap": L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  })
};

const overlayMaps = {};

// Map initialization
const map = L.map("map", {
  attributionControl: true,
  layers: [baseMaps.OpenStreetMap],
  center: [22.35, 114.16],
  zoom: 11
});
L.control.scale().addTo(map);
const layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

map.on("click", (ev) => {
  L.marker(ev.latlng).bindPopup(`WGS84 coords: ${ev.latlng.toString()}`).addTo(map);
});
