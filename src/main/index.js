"use strict";

import {} from "./hkgov-api.js";
import {} from "../../libs/Leaflet.Coordinates@MrMufflon/Leaflet.Coordinates-0.1.5.min.js";
// import {} from "../../libs/Leaflet.Locate@domoritz/L.Control.Locate.min.js";

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
    maxZoom: 19,
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
    const container = document.createElement("div");
    container.style.width = "200px";
    container.style.background = "rgba(255,255,255,0.5)";
    container.style.textAlign = "left";
    map.on("zoomend", (ev) => {
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

// L.control.locate({ position: "bottomright" }).addTo(map);
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

let FileLoader = L.Control.extend({
  options: {
    position: "topleft"
  },
  onAdd: function () {
    let el = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    let a = L.DomUtil.create("a", "leaflet-bar-part leaflet-bar-part-single", el);
    a.textContent = "📁";
    a.href = "#";
    a.setAttribute("role", "button");
    // a.style.fontSize = "1.375rem";
    a.style.fontSize = "1.1rem";

    let input = L.DomUtil.create("input", "", el);
    input.type = "file";
    input.hidden = true;

    L.DomEvent.on(a, "click", function (ev) {
      L.DomEvent.stopPropagation(ev);
      L.DomEvent.preventDefault(ev);
      input.click();
    });

    L.DomEvent.on(input, "input", async function (ev) {
      let file = ev.target.files[0];
      layerControl.addOverlay(L.geoJson(JSON.parse(await file.text())), file.name);

      self.file = file;
    });

    return el;
  }
});
let fileLoader = new FileLoader({ position: "topleft" }).addTo(map);

let Paste = L.Control.extend({
  options: {
    position: "topleft"
  },
  onAdd: function () {
    let el = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    let a = L.DomUtil.create("a", "leaflet-bar-part leaflet-bar-part-single", el);
    a.textContent = "📄";
    a.href = "#";
    a.setAttribute("role", "button");
    a.style.fontSize = "1.1rem";

    L.DomEvent.on(a, "click", async function (ev) {
      L.DomEvent.stopPropagation(ev);
      L.DomEvent.preventDefault(ev);

      const clipboardContents = await navigator.clipboard.read();
      for (const item of clipboardContents) {
        if (!item.types.includes("image/png")) {
          throw new Error("Clipboard does not contain PNG image data.");
        };
        let url = URL.createObjectURL(await item.getType("image/png"));
        console.debug(url);
        layerControl.addOverlay(L.imageOverlay(url, map.getBounds(), { opacity: 0.5 }), "Clipboard item");
        break;
      }
    });

    return el;
  }
});
let paste = new Paste({ position: "topleft" }).addTo(map);

let GridCoords = L.GridLayer.extend({
  createTile: function (coords) {
    const tile = document.createElement("div");
    tile.innerHTML = [coords.x, coords.y, coords.z].join(", ");
    tile.style.outline = "1px solid #7baaf7";
    tile.style.color = "#7baaf7";
    tile.style.opacity = "0.7";
    tile.style.fontSize = "1rem";
    tile.style.display = "flex";
    tile.style.justifyContent = "center";
    tile.style.alignItems = "center";
    return tile;
  }
});
layerControl.addOverlay(new GridCoords(), "Grid cells");

self.map = map;
