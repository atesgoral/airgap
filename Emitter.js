export class Emitter {
  constructor(emitterCanvas) {
    this.emitterCanvas = emitterCanvas;
    this.emitterCtx = emitter.getContext('2d');

    emitterCanvas.width = emitterCanvas.clientWidth;
    emitterCanvas.height = emitterCanvas.clientHeight;
  }

  emit(color) {
    const cssColor = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;

    this.emitterCtx.fillStyle = cssColor;
    this.emitterCtx.fillRect(
      0, 0,
      this.emitterCanvas.width, this.emitterCanvas.height
    );
  }
}
