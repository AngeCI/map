"use strict";

import {latLngToUTM, latLngToMGRS} from "./utm.js";
import {latLngToMaidenHead} from "./maidenhead.js"
import {} from "./hkgov-api.js";
import {} from "../../libs/Leaflet.Coordinates@MrMufflon/Leaflet.Coordinates-0.1.5.min.js";
// import {} from "../../libs/Leaflet.Locate@domoritz/L.Control.Locate.min.js";

// Base map source definitions
const baseMaps = {
  "OpenStreetMap": L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxNativeZoom: 19,
    maxZoom: 21,
    attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }),
  "CartoDB (light)": L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
    maxZoom: 29,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attribution">CARTO</a>'
  }),
  "CartoDB (dark)": L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png", {
    maxZoom: 29,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attribution">CARTO</a>'
  }),
  "HK Lands Dept Topo": L.tileLayer.hkGov("basemap", "basemap", {
    maxNativeZoom: 20,
    maxZoom: 21,
    minZoom: 10,
    attribution: '© <a href="https://api.portal.hkmapservice.gov.hk/disclaimer">Lands Department <img src="https://api.hkmapservice.gov.hk/mapapi/landsdlogo.jpg" width="25" height="25" /></a>'
  }),
  "HK Lands Dept Aerial": L.tileLayer.hkGov("basemap", "imagery", {
    maxNativeZoom: 19,
    maxZoom: 21,
    attribution: '© <a href="https://api.portal.hkmapservice.gov.hk/disclaimer">Lands Department <img src="https://api.hkmapservice.gov.hk/mapapi/landsdlogo.jpg" width="25" height="25" /></a>'
  })
};

const labelMaps = {
  "CartoDB (light)": L.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png", {
    maxZoom: 29,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attribution">CARTO</a>',
    pane: "labels"
  }),
  "CartoDB (dark)": L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png", {
    maxZoom: 29,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attribution">CARTO</a>',
    pane: "labels"
  }),
  "HK Lands Dept (English)": L.tileLayer.hkGov("label", "en", {
    maxNativeZoom: 20,
    maxZoom: 21,
    minZoom: 10,
    attribution: '© <a href="https://api.portal.hkmapservice.gov.hk/disclaimer">Lands Department <img src="https://api.hkmapservice.gov.hk/mapapi/landsdlogo.jpg" width="25" height="25" /></a>',
    pane: "labels"
  }),
  "HK Lands Dept (Traditional Chinese)": L.tileLayer.hkGov("label", "tc", {
    maxNativeZoom: 20,
    maxZoom: 21,
    minZoom: 10,
    attribution: '© <a href="https://api.portal.hkmapservice.gov.hk/disclaimer">Lands Department <img src="https://api.hkmapservice.gov.hk/mapapi/landsdlogo.jpg" width="25" height="25" /></a>',
    pane: "labels"
  }),
  "HK Lands Dept (Simplified Chinese)": L.tileLayer.hkGov("label", "sc", {
    maxNativeZoom: 20,
    maxZoom: 21,
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
  worldCopyJump: true,
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

  let utm = latLngToUTM(ev.latlng.lat, ev.latlng.lng);
  let mgrs = latLngToMGRS(ev.latlng.lat, ev.latlng.lng);
  mgrs[2] = mgrs[2].toString().padStart(5, "0");
  mgrs[3] = mgrs[3].toString().padStart(5, "0");

  clickMarker = L.marker(ev.latlng).bindPopup(`WGS84 coords: ${ev.latlng.toString()}
<br>UTM: ${utm[0]}${utm[1]} ${utm[2]} ${utm[3]}
<br>MGRS: ${mgrs.join(" ")}
<br>Maidenhead: ${latLngToMaidenHead(ev.latlng.lat, ev.latlng.lng)}`).addTo(map);
});

// Serach button
let SearchBtn = L.Control.extend({
  options: {
    position: "topleft"
  },
  onAdd: function () {
    let el = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    let a = L.DomUtil.create("a", "leaflet-bar-part leaflet-bar-part-single", el);
    a.textContent = "🔎";
    a.href = "#";
    a.setAttribute("role", "button");
    a.style.fontSize = "1.1rem";

    L.DomEvent.on(a, "click", function (ev) {
      L.DomEvent.stopPropagation(ev);
      L.DomEvent.preventDefault(ev);
    });

    return el;
  }
});
let searchBtn = new SearchBtn({ position: "topleft" }).addTo(map);

// File loader
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
  options: {
    opacity: 0.7
  },
  createTile: function (coords) {
    const tile = document.createElement("div");
    tile.classList.add("grid");
    tile.innerHTML = [coords.x, coords.y, coords.z].join(", ");
    return tile;
  }
});
layerControl.addOverlay(new GridCoords(), "Grid cells");

if (location.hash) {
  let coords = location.hash.split(",");
  let latitude = coords[0].slice(1);
  let longitude = coords[1];
  if (coords[2]) {
    let scale = coords[2].split(/^(\d*)z$/g)[1];
    map.setView([latitude, longitude], scale);
  } else {
    map.setView([latitude, longitude]);
  };
  L.marker([latitude, longitude]).bindPopup(`WGS84 coords: ${latitude}, ${longitude}
<br>UTM: ${utm[0]}${utm[1]} ${utm[2]} ${utm[3]}
<br>MGRS: ${latLngToMGRS(ev.latlng.lat, ev.latlng.lng).join(" ")}
<br>Maidenhead: ${latLngToMaidenHead(ev.latlng.lat, ev.latlng.lng)}`).addTo(map);
};

self.map = map;
