"use strict";

import {latLngToUTM, latLngToMGRS} from "./utm.js";
import {latLngToMaidenhead} from "./maidenhead.js"
import {latLngToHK1980} from "./hk1980.js";
import {latLngToOsmShortUrl} from "./osmShortUrl.js";
import {latLngToGeohash} from "./geohash.js";
import {} from "./hkgov-api.js";
import {} from "../../libs/Leaflet.Coordinates@MrMufflon/Leaflet.Coordinates-0.1.5.min.js";
import {} from "../../libs/Leaflet.ImageOverlay.Rotated@IvanSanchez/Leaflet.ImageOverlay.Rotated.min.js";
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
  }),
  "OpenFreeMap Liberty": L.maplibreGL({
    style: "https://tiles.openfreemap.org/styles/liberty",
    maxZoom: 21,
    attribution: '© <a href="https://openfreemap.org">OpenFreeMap</a>'
  }),
  "OpenFreeMap Positron": L.maplibreGL({
    style: "https://tiles.openfreemap.org/styles/positron",
    maxZoom: 21,
    attribution: '© <a href="https://openfreemap.org">OpenFreeMap</a>'
  }),
  "OpenFreeMap Bright": L.maplibreGL({
    style: "https://tiles.openfreemap.org/styles/bright",
    maxZoom: 21,
    attribution: '© <a href="https://openfreemap.org">OpenFreeMap</a>'
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

let locationMarker = function (map, lat, lng) {
  let marker;
  let utm = latLngToUTM(lat, lng);
  let mgrs = latLngToMGRS(lat, lng);
  mgrs[1] = mgrs[1].toString().padStart(5, "0");
  mgrs[2] = mgrs[2].toString().padStart(5, "0");
  let truncatedLat = L.NumberFormatter.round(lat, 5), truncatedLng = L.NumberFormatter.round(lng, 5);

  let container = document.createElement("div");
  container.innerHTML = `WGS84 coords: (${truncatedLat}, ${truncatedLng})
<br>UTM: ${utm[0]}${utm[1]} ${utm[2]} ${utm[3]}
<br>MGRS: ${mgrs.join(" ")}
<br>Maidenhead: ${latLngToMaidenhead(lat, lng)}
<br>Geohash: ${latLngToGeohash(lat, lng)}`;
  if (L.latLngBounds([[22.13, 113.82], [22.57, 114.5]]).contains([lat, lng])) {
    let hk1980GridCoord = latLngToHK1980(lat, lng);
    container.innerHTML += `<br>HK1980 grid coords: ${hk1980GridCoord[1]}mN ${hk1980GridCoord[0]}mE`;
  };

  container.appendChild(document.createElement("hr"));

  let glMapBtn = L.DomUtil.create("a", "", container);
  glMapBtn.textContent = "Google Map";
  glMapBtn.href = `https://www.google.com/maps?q=${truncatedLat},${truncatedLng}&z={map.getZoom()}`;
  glMapBtn.target = "_blank";

  container.appendChild(document.createTextNode(" · "));

  let streetViewBtn = L.DomUtil.create("a", "", container);
  streetViewBtn.textContent = "Nearest street view";
  streetViewBtn.href = `https://www.google.com/maps?q=${truncatedLat},${truncatedLng}&z=${map.getZoom()}&layer=c&cbll=${truncatedLat},${truncatedLng}`;
  streetViewBtn.target = "_blank";

  container.appendChild(document.createTextNode(" · "));

  let osmBtn = L.DomUtil.create("a", "", container);
  osmBtn.textContent = "OpenStreetMap";
  osmBtn.href = `https://osm.org/go/${latLngToOsmShortUrl(lat, lng, map.getZoom())}?m`;
  osmBtn.target = "_blank";

  container.appendChild(document.createElement("hr"));

  let copyBtn = L.DomUtil.create("a", "", container);
  copyBtn.textContent = "Copy link";
  copyBtn.href = "#";
  L.DomEvent.on(copyBtn, "click", function (ev) {
    L.DomEvent.stopPropagation(ev);
    L.DomEvent.preventDefault(ev);
    navigator.clipboard.writeText(`${location.href}#${truncatedLat},${truncatedLng},${map.getZoom()}z`);
  });

  container.appendChild(document.createTextNode(" · "));

  let removeBtn = L.DomUtil.create("a", "", container);
  removeBtn.textContent = "Remove";
  removeBtn.href = "#";
  L.DomEvent.on(removeBtn, "click", function (ev) {
    L.DomEvent.stopPropagation(ev);
    L.DomEvent.preventDefault(ev);
    marker.removeFrom(map);
  });
  L.DomEvent.on(removeBtn, "mousedown", L.DomEvent.stopPropagation);
  L.DomEvent.on(removeBtn, "doubleclick", L.DomEvent.stopPropagation);

  marker = L.marker([lat, lng]).bindPopup(container);

  return marker;
};

map.on("click", (ev) => {
  locationMarker(map, ev.latlng.lat, ev.latlng.lng).addTo(map).openPopup();
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

    L.DomEvent.on(input, "click", L.DomEvent.stopPropagation);

    L.DomEvent.on(input, "input", async function (ev) {
      let file = ev.target.files[0];
      layerControl.addOverlay(L.geoJson(JSON.parse(await file.text())), file.name);
      layerControl.getContainer().children[1].children[2].querySelector("label:last-child input").click();

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
        let imageOverlay = L.imageOverlay.rotated(url, map.getBounds().getNorthWest(), map.getBounds().getNorthEast(), map.getBounds().getSouthWest(), {
          opacity: 0.5,
          interactive: true
        });

        let marker1 = L.marker(map.getBounds().getNorthWest(), { draggable: true });
        let marker2 = L.marker(map.getBounds().getNorthEast(), { draggable: true });
        let marker3 = L.marker(map.getBounds().getSouthWest(), { draggable: true });
        let marker4 = L.marker(map.getBounds().getSouthEast(), { draggable: true });

        let repositionImage = function () {
          imageOverlay.reposition(marker1.getLatLng(), marker2.getLatLng(), marker3.getLatLng());
          marker4.setLatLng([
            marker2.getLatLng().lat + marker3.getLatLng().lat - marker1.getLatLng().lat,
            marker2.getLatLng().lng + marker3.getLatLng().lng - marker1.getLatLng().lng
          ]);
        };

        marker1.on("drag dragend", repositionImage);
        marker2.on("drag dragend", repositionImage);
        marker3.on("drag dragend", repositionImage);
        marker4.on("drag dragend", () => {
          marker1.setLatLng([
            marker2.getLatLng().lat + marker3.getLatLng().lat - marker4.getLatLng().lat,
            marker2.getLatLng().lng + marker3.getLatLng().lng - marker4.getLatLng().lng
          ]);
          repositionImage();
        });

        layerControl.addOverlay(L.layerGroup([imageOverlay, marker1, marker2, marker3, marker4]), "Clipboard item");
        layerControl.getContainer().children[1].children[2].querySelector("label:last-child input").click();
        break;
      }
    });

    return el;
  }
});
let paste = new Paste({ position: "topleft" }).addTo(map);

let Projection = L.Control.extend({
  options: {
    position: "topleft"
  },
  onAdd: function () {
    let el = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    let a = L.DomUtil.create("a", "leaflet-bar-part leaflet-bar-part-single", el);
    a.textContent = "🗺️";
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
let projection = new Projection().addTo(map);

let ViewSource = L.Control.extend({
  options: {
    position: "bottomleft"
  },
  onAdd: function () {
    let el = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    let a = L.DomUtil.create("a", "leaflet-bar-part leaflet-bar-part-single", el);
    a.href = "https://github.com/AngeCI/map";
    a.target = "_blank";
    a.setAttribute("role", "button");
    a.style.fontSize = "1.1rem";

    L.DomEvent.on(a, "click", L.DomEvent.stopPropagation);

    return el;
  }
});
let viewSource = new ViewSource().addTo(map);

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
  locationMarker(map, latitude, longitude).addTo(map).openPopup();
};

self.map = map;
self.locationMarker = locationMarker;
