export class Graph {
  constructor(graphCanvas) {
    this.graphCanvas = graphCanvas;
    this.graphCtx = graphCanvas.getContext('2d');

    graphCanvas.width = graphCanvas.clientWidth;
    graphCanvas.height = graphCanvas.clientHeight;

    // @TODO: remove
    this.height = graphCanvas.height;
  }

  init() {
    this.graphCtx.globalCompositeOperation = 'source-over';
    this.graphCtx.fillStyle = '#000';
    this.graphCtx.fillRect(
      0, 0,
      this.graphCanvas.width, this.graphCanvas.height
    );
  }

  advance() {
    this.graphCtx.globalCompositeOperation = 'source-over';
    this.graphCtx.drawImage(this.graphCanvas, -1, 0);
    this.graphCtx.fillStyle = '#000';
    this.graphCtx.fillRect(
      this.graphCanvas.width - 1, 0,
      1, this.graphCanvas.height
    );

  }

  plot(color, y, h = 1) {
    this.graphCtx.globalCompositeOperation = 'lighter';
    this.graphCtx.fillStyle = `rgb(
      ${(color.r || 0) * 255},
      ${(color.g || 0) * 255},
      ${(color.b || 0) * 255}
    )`;
    this.graphCtx.fillRect(
      this.graphCanvas.width - 1, y,
      1, h
    );
  }
}
