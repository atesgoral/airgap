import {Canvas} from './Canvas.js';
import {Color} from './Color.js';

export class Graph extends Canvas {
  init() {
    this.fill({});
  }

  advance() {
    this.ctx.drawImage(this.canvas, -1, 0);
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(this.width - 1, 0, 1, this.height);
  }

  plot(color, y, h = 1) {
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.fillStyle = new Color(color).toCss();
    this.ctx.fillRect(this.width - 1, y, 1, h);
    this.ctx.globalCompositeOperation = 'source-over';
  }
}
