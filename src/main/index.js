"use strict";

import {} from "./hkgov-api.js";
import {} from "../../libs/Leaflet.Coordinates@MrMufflon/Leaflet.Coordinates-0.1.5.min.js";

// Base map source definitions
const baseMaps = {
  "OpenStreetMap": L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }),
  "CARTO": L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
    maxZoom: 30,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attribution">CARTO</a>'
  }),
  "HK Lands Dept Topo": L.tileLayer.hkGov("basemap", "basemap", {
    maxZoom: 20,
    attribution: '© <a href="https://api.portal.hkmapservice.gov.hk/disclaimer">Lands Department <img src="https://api.hkmapservice.gov.hk/mapapi/landsdlogo.jpg" width="25" height="25" /></a>'
  }),
  "HK Lands Dept Aerial": L.tileLayer.hkGov("basemap", "imagery", {
    maxZoom: 20,
    attribution: '© <a href="https://api.portal.hkmapservice.gov.hk/disclaimer">Lands Department <img src="https://api.hkmapservice.gov.hk/mapapi/landsdlogo.jpg" width="25" height="25" /></a>'
  })
};

const labelMaps = {
  "CARTO": L.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png", {
    maxZoom: 30,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attribution">CARTO</a>',
    pane: "labels"
  }),
  "HK Lands Dept (English)": L.tileLayer.hkGov("label", "en", {
    maxZoom: 20,
    minZoom: 10,
    attribution: '© <a href="https://api.portal.hkmapservice.gov.hk/disclaimer">Lands Department <img src="https://api.hkmapservice.gov.hk/mapapi/landsdlogo.jpg" width="25" height="25" /></a>',
    pane: "labels"
  }),
  "HK Lands Dept (Traditional Chinese)": L.tileLayer.hkGov("label", "tc", {
    maxZoom: 20,
    minZoom: 10,
    attribution: '© <a href="https://api.portal.hkmapservice.gov.hk/disclaimer">Lands Department <img src="https://api.hkmapservice.gov.hk/mapapi/landsdlogo.jpg" width="25" height="25" /></a>',
    pane: "labels"
  }),
  "HK Lands Dept (Simplified Chinese)": L.tileLayer.hkGov("label", "sc", {
    maxZoom: 20,
    minZoom: 10,
    attribution: '© <a href="https://api.portal.hkmapservice.gov.hk/disclaimer">Lands Department <img src="https://api.hkmapservice.gov.hk/mapapi/landsdlogo.jpg" width="25" height="25" /></a>',
    pane: "labels"
  })
};

// Map initialization
const map = L.map("map", {
  attributionControl: true,
  zoomControl: false, // Move zoom control elsewhere
  layers: [baseMaps.OpenStreetMap],
  center: [22.35, 114.16],
  zoom: 11
});
L.control.scale().addTo(map);
const layerControl = L.control.layers(baseMaps, labelMaps).addTo(map);
const ZoomViewer = L.Control.extend({
  options: {
    position: "topright"
  },
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

const mouseposition = L.control.coordinates({
  position: "bottomright",
  decimals: 5,
  decimalSeperator: ".",
  labelTemplateLat: "Latitude: {y}",
  labelTemplateLng: "Longitude: {x}"
}).addTo(map);

L.control.locate({ position: "bottomright" }).addTo(map);
L.control.zoom({ position: "bottomright" }).addTo(map);

// Label pane
map.createPane("labels");
map.getPane("labels").style.zIndex = 650;
map.getPane("labels").style.pointerEvents = "none";

let clickMarker;
map.on("click", (ev) => {
  if (clickMarker)
    clickMarker.removeFrom(map);
  clickMarker = L.marker(ev.latlng).bindPopup(`WGS84 coords: ${ev.latlng.toString()}`).addTo(map);
});

self.map = map;
