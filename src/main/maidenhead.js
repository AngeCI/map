"use strict";

let latLngToMaidenhead = function (lat, lng) {
  let mdhLng = (lng + 180) * 52429 >>> 20; // Math.floor((lng + 180) / 20)
  let mdhLat = (lat + 90) * 52429 >>> 19; // Math.floor((lat + 90) / 10)

  let remainderLng = lng + 180 - mdhLng * 20;

  let mdhLngSquare = remainderLng >> 1;
  let mdhLatSquare = Math.floor(lat + 90 - mdhLat * 10);

  remainderLng -= mdhLngSquare << 1;

  let mdhLngSubsquare = remainderLng * 12;
  let mdhLatSubsquare = (lat - Math.floor(lat)) * 24;
  if (mdhLatSubsquare < 0)
    mdhLatSubsquare++;

  let mdhLngSubsubsquare = (mdhLngSubsquare * 524290 & 0x7ffff) * 10 >>> 19; // Math.floor((mdhLngSubsquare * 10) % 10)
  let mdhLatSubsubsquare = (mdhLatSubsquare * 524290 & 0x7ffff) * 10 >>> 19; // Math.floor((mdhLatSubsquare * 10) % 10)

  return `${String.fromCharCode(mdhLng + 65, mdhLat + 65)}${mdhLngSquare}${mdhLatSquare}${String.fromCharCode(mdhLngSubsquare + 97, mdhLatSubsquare + 97)}${mdhLngSubsubsquare}${mdhLatSubsubsquare}`;
};

export {
  latLngToMaidenhead
};
