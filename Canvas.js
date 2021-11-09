import {Color} from './Color.js';

export class Canvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = canvas.width = canvas.clientWidth;
    this.height = canvas.height = canvas.clientHeight;
  }

  fill(color) {
    this.ctx.fillStyle = new Color(color).toCss();
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
