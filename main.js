let signals = [];

function *scanlineIterator(width, height) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      yield {x, y};
    }
  }
}

function *serpentineIterator(width, height) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      yield {
        x: y & 1 ? width - 1 - x : x,
        y
      };
    }
  }
}

const calibration = {
  reset() {
    this.min = {r: Infinity, g: Infinity, b: Infinity};
    this.max = {r: 0, g: 0, b: 0};
  },
  train(color, _ts) {
    this.min = {
      r: Math.min(this.min.r, color.r),
      g: Math.min(this.min.g, color.g),
      b: Math.min(this.min.b, color.b)
    };
    this.max = {
      r: Math.max(this.max.r, color.r),
      g: Math.max(this.max.g, color.g),
      b: Math.max(this.max.b, color.b)
    };
  },
  normalize(color) {
    return {
      r: (color.r - this.min.r) / (this.max.r - this.min.r) + this.min.r,
      g: (color.g - this.min.g) / (this.max.g - this.min.g) + this.min.g,
      b: (color.b - this.min.b) / (this.max.b - this.min.b) + this.min.b
    };
  }
};

const outputRenderer = {
  init(output, iterator) {
    output.width = output.clientWidth;
    output.height = output.clientHeight;

    this.outputCtx = output.getContext('2d');

    this.outputCtx.clearRect(0, 0, output.width, output.height);

    const offscreen = document.createElement('canvas');
    offscreen.width = output.width;
    offscreen.height = output.height;

    this.offscreen = offscreen;
    this.offscreenCtx = offscreen.getContext('2d');

    this.it = iterator(output.width, output.height);
  },
  render(color) {
    if (!this.it) {
      return;
    }

    const {value: pos, done} = this.it.next();

    if (done) {
      this.it = null;
      return;
    }

    this.offscreenCtx.fillStyle = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;
    this.offscreenCtx.fillRect(pos.x, pos.y, 1, 1);

    this.outputCtx.drawImage(this.offscreen, 0, 0);
  }
};

function process(video) {
  emitter.width = emitter.clientWidth;
  emitter.height = emitter.clientHeight;

  const emitterCtx = emitter.getContext('2d');

  preview.width = preview.clientWidth;
  preview.height = preview.clientHeight;

  const previewCtx = preview.getContext('2d');

  const pixel = document.createElement('canvas');
  pixel.width = 1;
  pixel.height = 1;

  const pixelCtx = pixel.getContext('2d');

  graph.width = graph.clientWidth;
  graph.height = graph.clientHeight;

  const graphCtx = graph.getContext('2d');
  graphCtx.fillRect(0, 0, graph.width, graph.height);

  function nextFrame(t) {
    requestAnimationFrame(nextFrame);

    previewCtx.drawImage(
      video,
      0, 0, video.videoWidth, video.videoHeight,
      0, 0, preview.width, preview.height
    );
    pixelCtx.drawImage(
      video,
      0, 0, video.videoWidth, video.videoHeight,
      0, 0, 1, 1
    );

    if (!signals.length) {
      return;
    }

    const {signal, isCalibrating} = signals[0];
    const {value: original, done} = signal.next();

    if (done) {
      signals.shift();
      return;
    }

    if (original !== null) {
      emitterCtx.fillStyle = `rgb(${original.r * 255}, ${original.g * 255}, ${original.b * 255})`;
      emitterCtx.fillRect(0, 0, emitter.width, emitter.height);

      graphCtx.fillStyle = '#f00';
      graphCtx.fillRect(graph.width - 1, (1 - original.r) * graph.height / 2, 1, 1);
      graphCtx.fillStyle = '#0f0';
      graphCtx.fillRect(graph.width - 1, (1 - original.g) * graph.height / 2, 1, 1);
      graphCtx.fillStyle = '#00f';
      graphCtx.fillRect(graph.width - 1, (1 - original.b) * graph.height / 2, 1, 1);
    }

    const data = pixelCtx.getImageData(0, 0, 1, 1).data;
    const sample = {
      r: data[0] / 255,
      g: data[1] / 255,
      b: data[2] / 255
    };

    if (isCalibrating) {
      calibration.train(sample);
    }

    const normalized = calibration.normalize(sample);

    if (!isCalibrating) {
      outputRenderer.render(sample);
    }

    graphCtx.drawImage(graph, -1, 0);

    graphCtx.fillStyle = '#111';
    graphCtx.fillRect(graph.width - 1, 0, 1, graph.height);

    graphCtx.fillStyle = '#800';
    graphCtx.fillRect(graph.width - 1, (2 - sample.r) * graph.height / 2, 1, 1);
    graphCtx.fillStyle = '#080';
    graphCtx.fillRect(graph.width - 1, (2 - sample.g) * graph.height / 2, 1, 1);
    graphCtx.fillStyle = '#008';
    graphCtx.fillRect(graph.width - 1, (2 - sample.b) * graph.height / 2, 1, 1);

    graphCtx.fillStyle = '#f00';
    graphCtx.fillRect(graph.width - 1, (2 - normalized.r) * graph.height / 2, 1, 1);
    graphCtx.fillStyle = '#0f0';
    graphCtx.fillRect(graph.width - 1, (2 - normalized.g) * graph.height / 2, 1, 1);
    graphCtx.fillStyle = '#00f';
    graphCtx.fillRect(graph.width - 1, (2 - normalized.b) * graph.height / 2, 1, 1);

    graphCtx.fillStyle = 'rgba(255, 0, 0, 1)';
    graphCtx.fillRect(
      0, (2 - calibration.max.r) * graph.height / 2,
      3, (calibration.max.r - calibration.min.r) * graph.height / 2
    );
    graphCtx.fillStyle = 'rgba(0, 255, 0, 1)';
    graphCtx.fillRect(
      3, (2 - calibration.max.g) * graph.height / 2,
      3, (calibration.max.g - calibration.min.g) * graph.height / 2
    );
    graphCtx.fillStyle = 'rgba(0, 0, 255, 1)';
    graphCtx.fillRect(
      6, (2 - calibration.max.b) * graph.height / 2,
      3, (calibration.max.b - calibration.min.b) * graph.height / 2
    );
  }

  requestAnimationFrame(nextFrame);
}

function *calibrationSignal(seconds) {
  const frames = seconds * 60;

  for (let i = 0; i < frames; i++) {
    yield {
      r: (Math.sin(i / frames * Math.PI * 2) + 1) / 2,
      g: (Math.sin(i / frames * Math.PI * 3) + 1) / 2,
      b: (Math.sin(i / frames * Math.PI * 5) + 1) / 2
    };
  }
}

function *imageSignal(imageData, iterator, updatePosition) {
  const it = iterator(imageData.width, imageData.height);

  for (let pos of it) {
    updatePosition(pos.x, pos.y);

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

function *delay(seconds) {
  const frames = seconds * 60;

  for (let i = 0; i < frames; i++) {
    yield null;
  }
}

async function loadImage(url, iterator) {
  const image = new Image();

  return new Promise((resolve) => {
    image.onload = () => {
      input.width = input.clientWidth;
      input.height = input.clientHeight;

      const inputCtx = input.getContext('2d');

      const imageAspect = image.width / image.height;
      const inputAspect = input.width / input.height;

      if (imageAspect >= inputAspect) {
        const overflowWidth = input.height * image.width / image.height;

        function pasteImage() {
          inputCtx.drawImage(
            image,
            (input.width - overflowWidth) / 2, 0, overflowWidth, input.height
          );
        }
      } else {
        const overflowHeight = input.width * image.height / image.width;

        function pasteImage() {
          inputCtx.drawImage(
            image,
            0, (input.height - overflowHeight) / 2, input.width, overflowHeight
          );
        }
      }

      pasteImage();

      const imageData = inputCtx.getImageData(
        0, 0, input.width, input.height
      );

      resolve(imageSignal(imageData, iterator, (x, y) => {
        pasteImage();

        if (x === undefined) {
          return;
        }

        inputCtx.fillStyle = `hsla(0, 0%, ${(0.5 + Math.random() * 0.5) * 100}%, 0.75)`;

        inputCtx.fillRect(x, 0, 1, input.height);
        inputCtx.fillRect(0, y, input.width, 1);

        inputCtx.fillStyle = '#fff';

        inputCtx.fillRect(x, y, 1, 1);
      }));
    };

    image.src = url;
  });
}

async function init() {
  const constraints = {
    video: true
  };

  const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

  const video = document.createElement('video');
  video.autoplay = true;
  video.srcObject = mediaStream;

  transmit.addEventListener('click', async () => {
    const iterator = true
      ? scanlineIterator
      : serpentineIterator;
    const imageUrl = true
      ? 'img_600x600_3x8bit_RGB_color_SMPTE_RP_219_2002.png'
      : 'kodim23.png';

    const imageSignal = await loadImage(imageUrl, iterator);
    outputRenderer.init(output, iterator);

    calibration.reset();

    signals = [];

    signals.push({signal: calibrationSignal(5), isCalibrating: true});
    // signals.push({signal: delay(0.5)});
    signals.push({signal: imageSignal});
  });

  process(video);
}

window.addEventListener('load', init);
