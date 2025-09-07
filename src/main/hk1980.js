"use strict";

/**
 * proj4.defs("EPSG:2326", "+proj=tmerc +lat_0=22.312133333333333 +lon_0=114.17855555555556 +x_0=836694.05 +y_0=819069.8 +ellps=intl +units=m");
 */

let latLngToHK1980 = function (lat, lng) {
  lat = (lat + 0.0015277777777777778) * 0.017453292519943295;
  let deltaLng = (lng - 114.181) * 0.017453292519943295;
  let m = (0.9983172140119684 * lat - 0.002525238223271481 * Math.sin(lat * 2) + 0.0000026481030603034634 * Math.sin(lat * 4)) * 6378388; // meridian distance to equator

  return [
    Math.floor(836694.05 + (deltaLng * Math.cos(lat) + deltaLng * deltaLng * deltaLng / 6 * (Math.cos(lat) ** 3) * (1.0057926350989976 - Math.tan(lat) ** 2)) * 6381480.502),
    Math.floor(819069.80 + (m - 2468395.7281846893 + 1595370.1255 * deltaLng * deltaLng * Math.sin(2 * lat)))
  ];
};

let meridianDistanceReverse = function (M) {
  let R_target = M / 6378388;
  let f = function (lat) {
    return (0.9983172140119684 * lat - 0.002525238223271481 * Math.sin(lat * 2) + 0.0000026481030603034634 * Math.sin(lat * 4)) - R_target;
  };
  let f_prime = function (lat) {
    return 0.9983172140119684 - 0.005050476446542962 * Math.cos(lat * 2) + 0.000010592412241213853 * Math.cos(lat * 4);
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

let hk1980ToLatLng = function (n, e) {
  let de = e - 836694.05;
  let M = n + 1649325.9281846893;
  let fr = meridianDistanceReverse(M);

  // Use fr to calculate rr, ur, psir
  let rr = 6378388 * (1 - 0.006722670022333322) / (1 - 0.006722670022333322 * Math.sin(fr) ** 2) ** 1.5;
  let ur = 6378388 / Math.sqrt(1 - 0.006722670022333322 * Math.sin(fr) ** 2);
  let psir = ur / rr;

  return [
    (114.17855555555556 + de / ur / Math.cos(fr) - de * de * de / 6 / ur ** 3 / Math.cos(fr) * (psir + 2 * Math.tan(fr) ** 2)) * 57.29577951308232 - 0.0015277777777777778,
    (fr - 0.5 * Math.tan(fr) * de * de / rr / ur) * 57.29577951308232 + 0.002444444444444445
  ];
};

export {
  latLngToHK1980,
  hk1980ToLatLng
};
