function *imageSignal(imageData, iterator, updatePosition) {
  const it = iterator(imageData.width, imageData.height);

  for (let pos of it) {
    updatePosition(pos);

    const offset = (pos.y * imageData.width + pos.x) * 4;
    const data = imageData.data;

    yield {
      r: data[offset] / 255,
      g: data[offset + 1] / 255,
      b: data[offset + 2] / 255
    };
  }

  updatePosition();
}

function pasteImage(image, ctx) {
  const {canvas} = ctx;
  const imageAspectRatio = image.width / image.height;
  const inputAspectRatio = canvas.width / canvas.height;

  if (imageAspectRatio >= inputAspectRatio) {
    const overflowWidth = canvas.height * imageAspectRatio;

    ctx.drawImage(
      image,
      (canvas.width - overflowWidth) / 2, 0,
      overflowWidth, canvas.height
    );
  } else {
    const overflowHeight = canvas.width / imageAspectRatio;

    ctx.drawImage(
      image,
      0, (canvas.height - overflowHeight) / 2,
      canvas.width, overflowHeight
    );
  }
}

export class Input {
  constructor(inputCanvas) {
    this.inputCanvas = inputCanvas;
    this.inputCtx = inputCanvas.getContext('2d');

    inputCanvas.width = inputCanvas.clientWidth;
    inputCanvas.height = inputCanvas.clientHeight;
  }

  async init(url, iterator) {
    const image = new Image();

    image.src = url;

    return new Promise((resolve) => {
      image.onload = () => {
        pasteImage(image, this.inputCtx);

        const imageData = this.inputCtx.getImageData(
          0, 0,
          this.inputCanvas.width, this.inputCanvas.height
        );

        resolve(imageSignal(imageData, iterator, (pos) => {
          pasteImage(image, this.inputCtx);

          if (!pos) {
            return;
          }

          this.inputCtx.globalCompositeOperation = 'difference';
          this.inputCtx.fillStyle = `hsl(0, 0%, ${(Math.random() / 2 + 0.5) * 100}%)`;

          this.inputCtx.fillRect(pos.x, 0, 1, this.inputCanvas.height);
          this.inputCtx.fillRect(0, pos.y, this.inputCanvas.width, 1);

          this.inputCtx.globalCompositeOperation = 'source-over';
          this.inputCtx.fillStyle = '#fff';

          this.inputCtx.fillRect(pos.x, pos.y, 1, 1);
        }));
      };
    });
  }
}
