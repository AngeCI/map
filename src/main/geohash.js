"use strict";

let interleave = function (x, y) {
  x = (x | (x << 8)) & 0x00ff00ff;
  x = (x | (x << 4)) & 0x0f0f0f0f;
  x = (x | (x << 2)) & 0x33333333;
  x = (x | (x << 1)) & 0x55555555;
  y = (y | (y << 8)) & 0x00ff00ff;
  y = (y | (y << 4)) & 0x0f0f0f0f;
  y = (y | (y << 2)) & 0x33333333;
  y = (y | (y << 1)) & 0x55555555;
  return (x << 1) | y;
};

let latLngToGeohash = function (lat, lng) {
  const letterTable = "0123456789bcdefghjkmnpqrstuvwxyz";
  let x = Math.floor((lng + 180) % 360 * 182.04444444444444);
  let y = Math.floor((lat + 90) * 364.0888888888889);
  let c = interleave(x, y);

  let str = [];

  for (let i = 0; i < 5; i++) {
    let letter = (c >> (27 - 5 * i)) & 0x1f;
    str[i] = letterTable[letter];
  };

  return str.join("");
};

export {
  latLngToGeohash
};
