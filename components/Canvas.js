/** @typedef {import('../lib/Color.js').Color} Color */

export class Canvas {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {number} [intrinsicWidth]
   * @param {number} [intrinsicHeight]
   */
  constructor(canvas, intrinsicWidth, intrinsicHeight) {
    /** @readonly */
    this.canvas = canvas;
    /** @protected @readonly */
    this.ctx = /** @type {CanvasRenderingContext2D} */ (
      canvas.getContext('2d')
    );

    /** @readonly */
    this.width = canvas.width = intrinsicWidth || canvas.clientWidth;
    /** @readonly */
    this.height = canvas.height = intrinsicHeight || canvas.clientHeight;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * @param {Color} color
   */
  fill(color) {
    this.ctx.fillStyle = color.toCss();
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * @param {HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} image
   * @param {number} [width]
   * @param {number} [height]
   */
  stretchImage(image, width, height) {
    this.ctx.drawImage(
      image,
      0,
      0,
      width || image.width,
      height || image.height,
      0,
      0,
      this.width,
      this.height
    );
  }

  /**
   * @param {HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} image
   */
  coverImage(image) {
    const imageAspectRatio = image.width / image.height;
    const inputAspectRatio = this.width / this.height;

    if (imageAspectRatio >= inputAspectRatio) {
      const overflowWidth = this.height * imageAspectRatio;

      this.ctx.drawImage(
        image,
        (this.width - overflowWidth) / 2,
        0,
        overflowWidth,
        this.height
      );
    } else {
      const overflowHeight = this.width / imageAspectRatio;

      this.ctx.drawImage(
        image,
        0,
        (this.height - overflowHeight) / 2,
        this.width,
        overflowHeight
      );
    }
  }
}
