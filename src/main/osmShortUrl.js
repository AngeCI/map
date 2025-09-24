"use strict";

const letterTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_~";

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

let latLngToOsmShortUrl = function (lat, lng, zoom) {
  let x = (lng + 180) % 360 * 11930464.711111111;
  let y = (lat + 90) * 23860929.422222222;
  let c1 = interleave(x >>> 17, y >>> 17), c2 = interleave((x >>> 2) & 0x7fff, (y >>> 2) & 0x7fff);

  const d = Math.ceil((zoom + 8) / 3);
  const r = (zoom + 8) % 3;

  let str = Array(d + r);
  if (r)
    str.fill("-", d);

  for (let i = 0; i < d && i < 5; i++) {
    let letter = (c1 >> (24 - 6 * i)) & 0x3f;
    str[i] = letterTable[letter];
  };
  for (let i = 5; i < d; i++) {
    let letter = (c2 >> (54 - 6 * i)) & 0x3f;
    str[i] = letterTable[letter];
  };

  return str.join("");
};

let osmShortUrlToLatLng = function (str) {
  str = str.replaceAll("@", "~"); // backward compatibility with the old format

  let x = 0, y = 0, z = -8;

  Array.from(str).forEach((c) => {
    let t = letterTable.indexOf(c);
    if (t == -1) return;
    x <<= 3;
    y <<= 3;
    for (let j = 2; j >= 0; j--) {
      x |= ((t & (1 << (j + j + 1))) == 0 ? 0 : (1 << j));
      y |= ((t & (1 << (j + j))) == 0 ? 0 : (1 << j));
    };
    z += 3;
  });

  x <<= (32 - z);
  y <<= (32 - z);

  return [
    y * 4.190951585769653e-8 - 90,
    x * 8.381903171539307e-8 - 180,
    z
  ];
};

export {
  latLngToOsmShortUrl,
  osmShortUrlToLatLng
};
