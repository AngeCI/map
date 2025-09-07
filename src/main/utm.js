"use strict";

let latLngToUTM = function (lat, lng) {
  let utmLng, utmLat;

  if (lat < -80) { // South polar region
    return lng < 0 ? "A" : "B";
  } else if (lat > 84) { // North polar region
    return lng < 0 ? "Y" : "Z";
  } else {
    utmLng = Math.floor((lng + 186) / 6);
    utmLat = (lat + 616) / 8;
    if (utmLat >= 73) // Skip the letter “I”
      utmLatLetter++;
    if (utmLatLetter >= 79) // Skip the letter “O”
      utmLatLetter++;
    if (utmLatLetter >= 89) // 80°-84° N becomes “X”
      utmLatLetter--;

    if (Math.floor(utmLatLetter) == 86 && lng >= 3 && lng < 12) // 32V exception
      utmLng = 32;
    if (Math.floor(utmLatLetter) == 88 && lng >= 0 && lng < 42 && utmLng & 1 == 0) // 31X-37X exceptions
      utmLng = ((lng + 3) / 12 << 1) + 31;
  };

  lat *= 0.017453292519943295; // convert to radian
  let deltaLng = (lng - utmLng * 6 + 183) * 0.017453292519943295;
  let originNorthing = lat >= 0 ? 0 : 10000000;
  let m = (0.9983243043123051 * lat - 0.0025145938766232847 * Math.sin(lat * 2) + 0.0000026258627022822934 * Math.sin(lat * 4)) * 6378137; // meridian distance to equator

  return [
    utmLng,
    String.fromCharCode(utmLat),
    Math.floor(500000 + (deltaLng * Math.cos(lat) + deltaLng * deltaLng * deltaLng * (Math.cos(lat) ** 3) / 6 * (1.0057682211010657 - Math.tan(lat) ** 2)) * 6378663.4706172),
    Math.floor(originNorthing + (m + 1594665.8676543 * deltaLng * deltaLng * Math.sin(2 * lat)) * 0.9996)
  ];
};

let latLngToMGRS = function (lat, lng) {
  let utm = latLngToUTM(lat, lng);
  let e = utm[2];
  let n = utm[3];
  let eCycle = (utm[0] - 1) % 3;
  let nCycle = !(utm[0] & 1);

  let millionE = Math.floor((e / 100000 + eCycle * 9) % 26 + 64);
  if (eCycle == 1 && millionE > 78) // Skip the letter “O”
    millionE++;

  let millionN = Math.floor((n / 100000 + nCycle * 5) % 20 + 65);
  if (millionN > 72) // Skip the letter “I”
    millionN++;
  if (millionN > 78) // Skip the letter “O”
    millionN++;

  return [
    `${utm[0]}${utm[1]}${String.fromCharCode(millionE)}${String.fromCharCode(millionN)}`,
    e % 100000,
    n % 100000
  ];
};

export {
  latLngToUTM,
  latLngToMGRS
};
