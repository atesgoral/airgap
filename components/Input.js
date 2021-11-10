import {Canvas} from './Canvas.js';
import {Color} from '../lib/Color.js';

/** @typedef {{x: number; y: number}} Point */
/** @typedef {{scan: (width: number, height: number) => Generator<Point>}} Scanner */

/**
 * @param {ImageData} imageData
 * @param {Scanner} scanner
 * @param {(pos?: Point) => void} updatePosition
 */
function* imageSignal(imageData, scanner, updatePosition) {
  const scan = scanner.scan(imageData.width, imageData.height);

  for (let pos of scan) {
    updatePosition(pos);

    const offset = (pos.y * imageData.width + pos.x) * 4;
    const data = imageData.data;

    yield new Color({
      r: data[offset] / 255,
      g: data[offset + 1] / 255,
      b: data[offset + 2] / 255,
    });
  }

  updatePosition();
}

export class Input extends Canvas {
  /**
   * @param {string} url
   * @param {*} scanner
   */
  async init(url, scanner) {
    const image = new Image();

    image.src = url;

    return new Promise((resolve) => {
      image.onload = () => {
        this.coverImage(image);

        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);

        resolve(
          imageSignal(imageData, scanner, (pos) => {
            this.coverImage(image);

            if (!pos) {
              return;
            }

            this.ctx.globalCompositeOperation = 'difference';
            this.ctx.fillStyle = `hsl(
            0, 0%, ${(Math.random() / 2 + 0.5) * 100}%
          )`;

            this.ctx.fillRect(pos.x, 0, 1, this.height);
            this.ctx.fillRect(0, pos.y, this.width, 1);

            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = '#fff';

            this.ctx.fillRect(pos.x, pos.y, 1, 1);
          })
        );
      };
    });
  }
}
