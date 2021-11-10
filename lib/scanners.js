/** @typedef {{x: number; y: number}} Point */
/** @typedef {{scan: (width: number, height: number) => Generator<Point>}} Scanner */

/** @type {Scanner} */
export const raster = {
  *scan(width, height) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        yield {x, y};
      }
    }
  },
};

/** @type {Scanner} */
export const serpentine = {
  *scan(width, height) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        yield {
          x: y & 1 ? width - 1 - x : x,
          y,
        };
      }
    }
  },
};
