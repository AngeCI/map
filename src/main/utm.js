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
      utmLat++;
    if (utmLat >= 79) // Skip the letter “O”
      utmLat++;
    if (utmLat >= 89) // 80°-84° N becomes “X”
      utmLat--;

    if (Math.floor(utmLat) == 86 && lng >= 3 && lng < 12) // 32V exception
      utmLng = 32;
    if (Math.floor(utmLat) == 88 && lng >= 0 && lng < 42 && (utmLng & 1) == 0) // 31X-37X exceptions
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

let meridianDistanceReverse = function (M) {
  let R_target = M / 6378137;
  let f = function (lat) {
    return (0.9983243043123051 * lat - 0.0025145938766232848 * Math.sin(lat * 2) + 2.625862702282293e-6 * Math.sin(lat * 4)) - R_target;
  };
  let f_prime = function (lat) {
    return 0.9983243043123051 - 0.005029187753246569 * Math.cos(lat * 2) + 1.0503450809129172e-5 * Math.cos(lat * 4);
  };
  let lat = R_target, new_lat;
  for (let i = 0; i < 10; i++) {
    let f_val = f(lat);
    let f_prime_val = f_prime(lat);

    if (Math.abs(f_prime_val) < 1e-15)
      throw new Error();

    new_lat = lat - f_val / f_prime_val;

    if (Math.abs(new_lat - lat) < 1e-9)
      return new_lat;

    lat = new_lat;
  };
  throw new Error();
};

let utmToLatLng = function (xZone, yZone, e, n) {
  let latIndex = yZone.charCodeAt(0) - 67;
  if (latIndex > 12) // Skip the letter “O”
    latIndex--;
  if (latIndex > 6) // Skip the letter “I”
    latIndex--;
  let lngOrigin = xZone * 6 - 183;

  let de = e - 500000;
  let M = (latIndex >= 10 ? n : n - 10000000) * 1.0004001600640256;
  let fr = meridianDistanceReverse(M);

  // Use fr to calculate rr, ur, psir
  let rr = 6378137 * (1 - 0.006694379990132355) / (1 - 0.006694379990132355 * Math.sin(fr) ** 2) ** 1.5;
  let ur = 6378137 / Math.sqrt(1 - 0.006694379990132355 * Math.sin(fr) ** 2);
  let psir = ur / rr;
  let d = de / ur * 1.0004001600640256;

  return [
    (lngOrigin * 0.017453292519943295 + d / Math.cos(fr) - d ** 3 / 6 / Math.cos(fr) * (psir + 2 * Math.tan(fr) ** 2)) * 57.29577951308232,
    (fr - 0.5002000800320128 * Math.tan(fr) * d * de / rr) * 57.29577951308232
  ];
};

let utmStrToLatLng = function (utmStr) {
  let groups = utmStr.match(/(\d{1,2})([A-Za-z]) (\d+) (\d+)/);
  return utmToLatLng(parseInt(groups[1]), groups[2].toUpperCase(), parseInt(groups[3]), parseInt(groups[4]));
};

let mgrsToLatLng = function (zone, million, e, n) {
  const xZone = parseInt(zone.match(/\d+/)[0]);
  const yZone = zone.match(/[A-Za-z]/)[0].toUpperCase();
  const eCycle = (xZone - 1) % 3;
  const nCycle = !(xZone & 1);
  const eOffset = String.charCodeAt(0) - 64 - eCycle * 9;
  const nOffset = String.charCodeAt(1) - 65 - nCycle * 5;

  return utmToLatLng(xZone, yZone, e + eOffset * 100000, n + nOffset * 100000);
};

let mgrsStrToLatLng = function (mgrsStr) {
  let groups = utmStr.match(/(\d{1,2}[A-Z])([A-Z]{2}) (\d+) (\d+)/);
  return mgrsToLatLng(groups[1], groups[2], parseInt(groups[3]), parseInt(groups[4]));
};

export {
  latLngToUTM,
  latLngToMGRS,
  utmToLatLng,
  utmStrToLatLng,
  mgrsToLatLng,
  mgrsStrToLatLng
};
