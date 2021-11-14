import {Color} from '../lib/Color.js';
import {Canvas} from './Canvas.js';

/** @typedef {{x: number; y: number}} Point */
/** @typedef {{scan: (width: number, height: number) => Generator<Point>}} Scanner */

export class Output extends Canvas {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super(canvas);

    this.offscreen = new Canvas(
      document.createElement('canvas'),
      this.width,
      this.height
    );
    this.offscreen.fill(Color.BLACK);
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
  plot(color) {
    if (!this.scan) {
      return;
    }

    const {value: pos, done} = this.scan.next();

    if (done) {
      this.scan = null;
      this.stretchImage(this.offscreen.canvas);
      return;
    }

    this.offscreen.point(color, pos);
    this.stretchImage(this.offscreen.canvas);

    this.crosshair(pos);
  }
}
