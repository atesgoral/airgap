import {Canvas} from './Canvas.js';
import {Color} from './Color.js';

export class Output extends Canvas {
  init(iterator) {
    this.clear();

    const offscreen = document.createElement('canvas');
    offscreen.width = this.width;
    offscreen.height = this.height;

    this.offscreen = offscreen;
    this.offscreenCtx = offscreen.getContext('2d');

    this.it = iterator(this.width, this.height);
  }

  render(color) {
    if (!this.it) {
      return;
    }

    const {value: pos, done} = this.it.next();

    if (done) {
      this.it = null;
      return;
    }

    this.offscreenCtx.fillStyle = new Color(color).toCss()
    this.offscreenCtx.fillRect(pos.x, pos.y, 1, 1);

    this.ctx.drawImage(this.offscreen, 0, 0);
  }
}
