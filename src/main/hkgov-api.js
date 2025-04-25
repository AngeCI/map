"use strict";

L.HKGov = {
  urlBase: "https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz",
  basemap: {
    basemap: {
      path: "/basemap",
      maxZoom: 20
    },
    imagery: {
      path: "/imagery",
      maxZoom: 19
    }
  },
  label: {
    en: {
      path: "/label/hk/en",
      maxZoom: 20
    },
    tc: {
      path: "/label/hk/tc",
      maxZoom: 20
    },
    sc: {
      path: "/label/hk/sc",
      maxZoom: 20
    }
  },
  crs: {
    wgs84: "WGS84"
  }
};

L.TileLayer.HKGov = L.TileLayer.extend({
  initialize: function(base, target = "", options) {
    let metaData = L.HKGov;

    // Assign defualt values if no second parameter is provided
    if (target == "") {
      if (base == "basemap") {
        target = "basemap";
      }
      if (base == "label") {
        target = "tc";
      }
    }

    if (!(base in metaData)) {
      throw `Unknown basemap type "${base}"`;
    }

    if ((base in metaData) && !(target in metaData[base])) {
      if (base == "basemap") {
        throw `Unknown target type "${target}"`;
      }
      if (base == "label") {
        throw `Unsupported label language "${target}"`;
      }
    }

    let tileTarget = metaData[base][target];
    let url = `${metaData.urlBase}${tileTarget.path}/${metaData.crs.wgs84}/{z}/{x}/{y}.png`;
    let defaultOpts = {
      maxZoom: tileTarget.maxZoom,
    };
    L.setOptions(this, defaultOpts);
    L.TileLayer.prototype.initialize.call(this, url, options);
  }
});

L.LayerGroup.HKGov = L.LayerGroup.extend({
  initialize: function(base, label = "tc", options) {
    let metaData = L.HKGov;

    if (!(base in metaData.basemap)) {
      throw `Unknown basemap type "${base}"`;
    }
    if (!(label in metaData.label)) {
      throw `Unsupported label language "${label}"`;
    }

    this._basemapLayer = L.tileLayer.hkGov("basemap", base);
    this._labelLayer = L.tileLayer.hkGov("label", label);

    let myLayers = [this._basemapLayer, this._labelLayer];
    L.LayerGroup.prototype.initialize.call(this, myLayers, options);
  },
  language: function(language) {
    let metaData = L.HKGov;
    if (!(language in metaData.label)) {
      throw `Unsupported label language "${language}"`;
    }

    this.removeLayer(this._labelLayer);
    this._labelLayer = L.tileLayer.hkGov("label", language);
    this.addLayer(this._labelLayer);
  }
});

L.tileLayer.hkGov = function(base, target, options) {
  return new L.TileLayer.HKGov(base, target, options);
};

L.layerGroup.hkGov = function(base, label, options) {
  return new L.LayerGroup.HKGov(base, label, options);
};
