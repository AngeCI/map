"use strict";

import * from "./hkgov-api.js";

// Base map source definitions
const baseMaps = {
  "OpenStreetMap": L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }),
  "CARTO": L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
    maxZoom: 30,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attribution">CARTO</a>'
  }),
  "HK Lands Dept Topo (No label)": L.tileLayer.hongKong("basemap", "basemap", {
    maxZoom: 20,
    attribution: '© <a href="https://api.portal.hkmapservice.gov.hk/disclaimer">Lands Department <img src="https://api.hkmapservice.gov.hk/mapapi/landsdlogo.jpg" width="25" height="25" /></a>'
  }),
  "HK Lands Dept Aerial (No label)": L.tileLayer.hongKong("basemap", "imagery", {
    maxZoom: 20,
    attribution: '© <a href="https://api.portal.hkmapservice.gov.hk/disclaimer">Lands Department <img src="https://api.hkmapservice.gov.hk/mapapi/landsdlogo.jpg" width="25" height="25" /></a>'
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
const ZoomViewer = L.Control.extend({
  onAdd() {
    const container = L.DomUtil.create("div");
    container.style.width = "200px";
    container.style.background = "rgba(255,255,255,0.5)";
    container.style.textAlign = "left";
    map.on("zoomstart zoom zoomend", (ev) => {
      container.innerHTML = `Zoom level: ${map.getZoom()}`;
    });
    return container;
  }
});
new ZoomViewer().addTo(map);

let clickMarker;
map.on("click", (ev) => {
  if (clickMarker)
    clickMarker.removeFrom(map);
  clickMarker = L.marker(ev.latlng).bindPopup(`WGS84 coords: ${ev.latlng.toString()}`).addTo(map);
});

self.map = map;
