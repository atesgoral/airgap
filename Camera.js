import {Canvas} from './Canvas.js';

export class Camera extends Canvas {
  async init() {
    this.video = document.createElement('video');

    this.video.autoplay = true;
    this.video.srcObject = await navigator.mediaDevices.getUserMedia({
      video: true
    });
  }

  snapshot() {
    this.stretchImage(
      this.video,
      this.video.videoWidth, this.video.videoHeight
    );
  }
}
