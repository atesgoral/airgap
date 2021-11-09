import {Canvas} from './Canvas.js';

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

export class Input extends Canvas {
  async init(url, iterator) {
    const image = new Image();

    image.src = url;

    return new Promise((resolve) => {
      image.onload = () => {
        this.coverImage(image);

        const imageData = this.ctx.getImageData(
          0, 0,
          this.width, this.height
        );

        resolve(imageSignal(imageData, iterator, (pos) => {
          this.coverImage(image);

          if (!pos) {
            return;
          }

          this.ctx.globalCompositeOperation = 'difference';
          this.ctx.fillStyle = `hsl(
            0, 0%, ${(Math.random() / 2 + 0.5) * 100}%
          )`;

          this.ctx.fillRect(pos.x, 0, 1, this.height);
          this.ctx.fillRect(0, pos.y, this.width, 1);

          this.ctx.globalCompositeOperation = 'source-over';
          this.ctx.fillStyle = '#fff';

          this.ctx.fillRect(pos.x, pos.y, 1, 1);
        }));
      };
    });
  }
}
