import {Canvas} from './Canvas.js';
import {Color} from '../lib/Color.js';

export class Graph extends Canvas {
  init() {
    this.fill(new Color({}));
  }

  advance() {
    this.ctx.drawImage(this.canvas, -1, 0);
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(this.width - 1, 0, 1, this.height);
  }

  /**
   * @param {Color} color
   */
  plot(color) {
    this.ctx.fillStyle = color.toCss();
    this.ctx.fillRect(this.width - 1, 0, 1, 10);

    this.ctx.globalCompositeOperation = 'lighter';

    for (let c of /** @type {Array<'r' | 'g' | 'b'>} */ (['r', 'g', 'b'])) {
      this.ctx.fillStyle = new Color({[c]: 1}).toCss();
      this.ctx.fillRect(
        this.width - 1,
        (1 - color[c]) * (this.height - 10) + 10,
        1,
        1
      );
    }

    this.ctx.globalCompositeOperation = 'source-over';
  }
}
