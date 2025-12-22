"use strict";

let latLngToMaidenhead = function (lat, lng) {
  const mdhLng = (lng + 180) * 52429 >>> 20; // Math.floor((lng + 180) / 20)
  const mdhLat = (lat + 90) * 52429 >>> 19; // Math.floor((lat + 90) / 10)

  let remainderLng = lng + 180 - mdhLng * 20;

  const mdhLngSquare = remainderLng >> 1;
  const mdhLatSquare = Math.floor(lat + 90 - mdhLat * 10);

  remainderLng -= mdhLngSquare << 1;

  const mdhLngSubsquare = remainderLng * 12;
  let mdhLatSubsquare = (lat - Math.floor(lat)) * 24;
  if (mdhLatSubsquare < 0)
    mdhLatSubsquare++;

  let mdhLngSubsubsquare = (mdhLngSubsquare * 524290 & 0x7ffff) * 10 >>> 19; // Math.floor((mdhLngSubsquare * 10) % 10)
  let mdhLatSubsubsquare = (mdhLatSubsquare * 524290 & 0x7ffff) * 10 >>> 19; // Math.floor((mdhLatSubsquare * 10) % 10)

  return `${String.fromCharCode(mdhLng + 65, mdhLat + 65)}${mdhLngSquare}${mdhLatSquare}${String.fromCharCode(mdhLngSubsquare + 97, mdhLatSubsquare + 97)}${mdhLngSubsubsquare}${mdhLatSubsubsquare}`;
};

let maidenheadToLatLng = function (mdh) {
  if (mdh.length & 1) {
    throw new TypeError("Maidenhead code length should be even.");
  };

  let lat = -90, lng = -180,
  multiplier = [20, 10, 2, 1, 0.08333333333333333, 0.041666666666666667, 0.008333333333333333, 0.004166666666666667, 0.00034722222222222222, 0.00017361111111111111],
  height = multiplier[mdh.length - 1],
  width = multiplier[mdh.length - 2];

  Array.from(mdh.toLowerCase()).map((e, i) => e.charCodeAt(0) - (i & 2 ? 48 : 97)).forEach((e, i) => {
    if (i & 1) {
      lat += e * multiplier[i];
    } else {
      lng += e * multiplier[i];
    };
  });

  return {
    bound: [[lat, lng], [lat + height, lng + width]],
    center: [lat + height * 0.5, lng + height]
  };
};

export {
  latLngToMaidenhead,
  maidenheadToLatLng
};
