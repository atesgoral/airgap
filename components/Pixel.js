import {Canvas} from './Canvas.js';
import {Color} from '../lib/Color.js';

export class Pixel extends Canvas {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas, 1, 1);
  }

  read() {
    const data = this.ctx.getImageData(0, 0, 1, 1).data;

    return new Color({
      r: data[0] / 255,
      g: data[1] / 255,
      b: data[2] / 255,
    });
  }
}
