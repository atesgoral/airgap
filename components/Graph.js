import {Canvas} from './Canvas.js';
import {Color} from '../lib/Color.js';

export class Graph extends Canvas {
  init() {
    this.fill(Color.BLACK);
  }

  advance() {
    this.ctx.drawImage(this.canvas, -1, 0);
    this.rect(Color.BLACK, {x: this.width - 1, y: 0}, 1, this.height);
  }

  /**
   * @param {Color} color
   */
  plot(color) {
    this.rect(color, {x: this.width - 1, y: 0}, 1, 10);

    this.ctx.globalCompositeOperation = 'lighter';

    for (let c of /** @type {Array<'r' | 'g' | 'b'>} */ (['r', 'g', 'b'])) {
      this.point(new Color({[c]: 1}), {
        x: this.width - 1,
        y: (1 - color[c]) * (this.height - 10) + 10,
      });
    }

    this.ctx.globalCompositeOperation = 'source-over';
  }
}
