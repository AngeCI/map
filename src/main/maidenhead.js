"use strict";

let latLngToMaidenhead = function (lat, lng) {
  let mdhLng = Math.floor((lng + 180) / 20);
  let mdhLat = Math.floor((lat + 90) / 10);

  let remainderLng = lng + 180 - mdhLng * 20;

  let mdhLngSquare = remainderLng >> 1;
  let mdhLatSquare = Math.floor(lat + 90 - mdhLat * 10);

  remainderLng -= mdhLngSquare << 1;

  let mdhLngSubsquare = remainderLng * 12;
  let mdhLatSubsquare = (lat - Math.floor(lat)) * 24;
  if (mdhLatSubsquare < 0)
    mdhLatSubsquare++;

  let mdhLngSubsubsquare = Math.floor((mdhLngSubsquare * 10) % 10);
  let mdhLatSubsubsquare = Math.floor((mdhLatSubsquare * 10) % 10);

  return `${String.fromCharCode(mdhLng + 65, mdhLat + 65)}${mdhLngSquare}${mdhLatSquare}${String.fromCharCode(mdhLngSubsquare + 97, mdhLatSubsquare + 97)}${mdhLngSubsubsquare}${mdhLatSubsubsquare}`;
};

export {
  latLngToMaidenhead
};
