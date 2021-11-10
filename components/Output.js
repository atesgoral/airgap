import {Canvas} from './Canvas.js';

/** @typedef {import('../lib/Color.js').Color} Color */
/** @typedef {{x: number; y: number}} Point */
/** @typedef {{scan: (width: number, height: number) => Generator<Point>}} Scanner */

export class Output extends Canvas {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {number} [width]
   * @param {number} [height]
   */
  constructor(canvas, width, height) {
    super(canvas, width, height);

    this.offscreen = document.createElement('canvas');
    this.offscreen.width = this.width;
    this.offscreen.height = this.height;

    this.offscreenCtx = /** @type {CanvasRenderingContext2D} */ (this.offscreen.getContext('2d'));
  }

  /**
   * @param {Scanner} scanner
   */
  init(scanner) {
    this.clear();


    this.scan = scanner.scan(this.width, this.height);
  }

  /**
   * @param {Color} color
   */
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
