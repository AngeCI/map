"use strict";

const letterTable = "0123456789bcdefghjkmnpqrstuvwxyz";

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
  const x = (lng + 180) % 360 * 11930464.711111111;
  const y = (lat + 90) * 23860929.422222222;
  const c1 = interleave(x >>> 17, y >>> 17), c2 = interleave((x >>> 2) & 0x7fff, (y >>> 2) & 0x7fff);

  let str = [];

  for (let i = 0; i < 6; i++) {
    let letter = (c1 >> (25 - 5 * i)) & 0x1f;
    str[i] = letterTable[letter];
  };
  for (let i = 6; i < 8; i++) { // Theoretically can go to 12, but it’s too precise.
    let letter = (c2 >> (55 - 5 * i)) & 0x1f;
    str[i] = letterTable[letter];
  };

  return str.join("");
};

export {
  latLngToGeohash
};
