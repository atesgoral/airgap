export class Receiver {
  constructor(cameraCanvas, pixelCanvas) {
    this.cameraCanvas = cameraCanvas;
    this.pixelCanvas = pixelCanvas;
    this.cameraCtx = cameraCanvas.getContext('2d');
    this.pixelCtx = pixelCanvas.getContext('2d');

    cameraCanvas.width = cameraCanvas.clientWidth;
    cameraCanvas.height = cameraCanvas.clientHeight;

    pixelCanvas.width = 1;
    pixelCanvas.height = 1;
  }

  async init() {
    this.video = document.createElement('video');

    this.video.autoplay = true;
    this.video.srcObject = await navigator.mediaDevices.getUserMedia({
      video: true
    });
  }

  sample() {
    this.cameraCtx.drawImage(
      this.video,
      0, 0, this.video.videoWidth, this.video.videoHeight,
      0, 0, this.cameraCanvas.width, this.cameraCanvas.height
    );
    this.pixelCtx.drawImage(
      this.video,
      0, 0, this.video.videoWidth, this.video.videoHeight,
      0, 0, 1, 1
    );

    const data = this.pixelCtx.getImageData(0, 0, 1, 1).data;

    return {
      r: data[0] / 255,
      g: data[1] / 255,
      b: data[2] / 255
    };
  }
}
