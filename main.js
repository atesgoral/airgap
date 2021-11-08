let signals = [];

function *scanlineIterator(width, height) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      yield {x, y};
    }
  }
}

const calibration = {
  min: Infinity,
  max: 0,
  reset() {
    this.min = Infinity;
    this.max = 0;
  },
  train(value, _ts) {
    this.min = Math.min(this.min, value);
    this.max = Math.max(this.max, value);
  },
  normalize(value) {
    const range = this.max - this.min;
    return (value - this.min) / range + this.min;
  }
};

const outputRenderer = {
  init(output) {
    output.width = output.clientWidth;
    output.height = output.clientHeight;

    this.outputCtx = output.getContext('2d');

    this.outputCtx.clearRect(0, 0, output.width, output.height);

    const offscreen = document.createElement('canvas');
    offscreen.width = output.width;
    offscreen.height = output.height;

    this.offscreen = offscreen;
    this.offscreenCtx = offscreen.getContext('2d');

    this.it = scanlineIterator(output.width, output.height);
  },
  render(value) {
    if (!this.it) {
      return;
    }

    const {value: pos, done} = this.it.next();

    if (done) {
      this.it = null;
      return;
    }

    const gray = value * 255;

    this.offscreenCtx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
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
  pixelCtx.filter = 'grayscale(100%)';

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

    const signal = signals[0];
    const {value, done} = signal?.next();

    if (done) {
      signals.shift();
      return;
    }

    if (value !== null) {
      emitterCtx.fillStyle = `hsl(0, 0%, ${value * 100}%)`;
      emitterCtx.fillRect(0, 0, emitter.width, emitter.height);
    }

    const sample = pixelCtx.getImageData(0, 0, 1, 1).data[0] / 255;

    calibration.train(sample);

    const normalized = calibration.normalize(sample);

    outputRenderer.render(sample);

    graphCtx.drawImage(graph, -1, 0);

    graphCtx.fillStyle = '#111';
    graphCtx.fillRect(graph.width - 1, 0, 1, graph.height);

    graphCtx.fillStyle = '#888';
    graphCtx.fillRect(graph.width - 1, (2 - sample) * graph.height / 2, 1, 1);

    graphCtx.fillStyle = '#eee';
    graphCtx.fillRect(graph.width - 1, (1 - value) * graph.height / 2, 1, 1);
    graphCtx.fillRect(graph.width - 1, (2 - normalized) * graph.height / 2, 1, 1);

    graphCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    graphCtx.fillRect(graph.width - 1, (2 - calibration.max) * graph.height / 2, 1, 1);
    graphCtx.fillStyle = 'rgba(0, 127, 255, 0.5)';
    graphCtx.fillRect(graph.width - 1, (2 - calibration.min) * graph.height / 2, 1, 1);
  }

  requestAnimationFrame(nextFrame);
}

function *calibrationSignal(seconds) {
  const frames = seconds * 60;

  for (let i = 0; i < frames; i++) {
    yield 1 - Math.abs(i / frames * 2 - 1);
  }
}

function *imageSignal(imageData, updatePosition) {
  const it = scanlineIterator(imageData.width, imageData.height);

  for (let pos of it) {
    updatePosition(pos.x, pos.y);
    yield imageData.data[(pos.y * imageData.width + pos.x) * 4] / 255; // R
  }

  updatePosition();
}

function *delay(seconds) {
  const frames = seconds * 60;

  for (let i = 0; i < frames; i++) {
    yield null;
  }
}

async function loadImage(url) {
  const image = new Image();

  return new Promise((resolve) => {
    image.onload = () => {
      input.width = input.clientWidth;
      input.height = input.clientHeight;

      const inputCtx = input.getContext('2d');

      inputCtx.filter = 'grayscale(100%)';

      function pasteImage() {
        inputCtx.drawImage(
          image,
          0, 0, image.width, image.height,
          0, 0, input.width, input.height
        );
      }

      pasteImage();

      const imageData = inputCtx.getImageData(
        0, 0, input.width, input.height
      );

      resolve(imageSignal(imageData, (x, y) => {
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
    const imageSignal = await loadImage('kodim23.png');

    calibration.reset();

    signals = [];

    signals.push(calibrationSignal(2));
    signals.push(delay(0.5));
    signals.push(imageSignal);

    outputRenderer.init(output);
  });

  process(video);
}

window.addEventListener('load', init);
