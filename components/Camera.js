import {Canvas} from './Canvas.js';

export class Camera extends Canvas {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {number} [width]
   * @param {number} [height]
   */
  constructor(canvas, width, height) {
    super(canvas, width, height);

    this.video = document.createElement('video');
    this.video.autoplay = true;
  }

  async init() {
    this.video.srcObject = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
  }

  snapshot() {
    this.stretchImage(
      this.video,
      this.video.videoWidth,
      this.video.videoHeight
    );
  }
}
