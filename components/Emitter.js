/** @typedef {import('../lib/Color.js').Color} Color */

import {Canvas} from './Canvas.js';

export class Emitter extends Canvas {
  /**
   * @param {Color} color
   */
  emit(color) {
    this.fill(color);
  }
}
