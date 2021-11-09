import {Color} from './Color.js';

export class Canvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = canvas.width = canvas.clientWidth;
    this.height = canvas.height = canvas.clientHeight;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  fill(color) {
    this.ctx.fillStyle = new Color(color).toCss();
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  pasteImage(image) {
    const imageAspectRatio = image.width / image.height;
    const inputAspectRatio = this.width / this.height;

    if (imageAspectRatio >= inputAspectRatio) {
      const overflowWidth = this.height * imageAspectRatio;

      this.ctx.drawImage(
        image,
        (this.width - overflowWidth) / 2, 0,
        overflowWidth, this.height
      );
    } else {
      const overflowHeight = this.width / imageAspectRatio;

      this.ctx.drawImage(
        image,
        0, (this.height - overflowHeight) / 2,
        this.width, overflowHeight
      );
    }
  }
}
