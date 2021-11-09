export class Output {
  constructor(outputCanvas) {
    this.outputCanvas = outputCanvas;
    this.outputCtx = outputCanvas.getContext('2d');

    outputCanvas.width = outputCanvas.clientWidth;
    outputCanvas.height = outputCanvas.clientHeight;
  }

  init(iterator) {
    this.outputCtx.clearRect(
      0, 0,
      this.outputCanvas.width, this.outputCanvas.height
    );

    const offscreen = document.createElement('canvas');
    offscreen.width = this.outputCanvas.width;
    offscreen.height = this.outputCanvas.height;

    this.offscreen = offscreen;
    this.offscreenCtx = offscreen.getContext('2d');

    this.it = iterator(this.outputCanvas.width, this.outputCanvas.height);
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

    const cssColor = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;

    this.offscreenCtx.fillStyle = cssColor;
    this.offscreenCtx.fillRect(pos.x, pos.y, 1, 1);

    this.outputCtx.drawImage(this.offscreen, 0, 0);
  }
}

