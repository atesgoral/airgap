import {Canvas} from './Canvas.js';

export class Output extends Canvas {
  init(scanner) {
    this.clear();

    const offscreen = document.createElement('canvas');
    offscreen.width = this.width;
    offscreen.height = this.height;

    this.offscreen = offscreen;
    this.offscreenCtx = offscreen.getContext('2d');

    this.scan = scanner.scan(this.width, this.height);
  }

  render(color) {
    if (!this.scan) {
      return;
    }

    const {value: pos, done} = this.scan.next();

    if (done) {
      this.scan = null;
      return;
    }

    this.offscreenCtx.fillStyle = color.toCss();
    this.offscreenCtx.fillRect(pos.x, pos.y, 1, 1);

    this.ctx.drawImage(this.offscreen, 0, 0);
  }
}
