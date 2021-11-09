import {Emitter} from './Emitter.js';
import {Receiver} from './Receiver.js';
import {Output} from './Output.js';

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

function clamp(v) {
  return Math.max(0, Math.min(1, v));
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
      r: clamp((color.r - this.min.r) / (this.max.r - this.min.r) + this.min.r),
      g: clamp((color.g - this.min.g) / (this.max.g - this.min.g) + this.min.g),
      b: clamp((color.b - this.min.b) / (this.max.b - this.min.b) + this.min.b)
    };
  }
};

function process(emitter, receiver, output) {
  graph.width = graph.clientWidth;
  graph.height = graph.clientHeight;

  const graphCtx = graph.getContext('2d');
  graphCtx.fillRect(0, 0, graph.width, graph.height);

  function nextFrame(t) {
    requestAnimationFrame(nextFrame);

    const sample = receiver.sample();

    if (!signals.length) {
      return;
    }

    const {signal, isCalibrating} = signals[0];
    const {value: original, done} = signal.next();

    if (done) {
      signals.shift();
      return;
    }

    graphCtx.globalCompositeOperation = 'source-over';

    graphCtx.drawImage(graph, -1, 0);

    graphCtx.fillStyle = '#000';
    graphCtx.fillRect(graph.width - 1, 0, 1, graph.height);

    graphCtx.globalCompositeOperation = 'lighter';

    if (original !== null) {
      const originalRgb = `rgb(${original.r * 255}, ${original.g * 255}, ${original.b * 255})`;

      emitter.emit(original);

      graphCtx.fillStyle = originalRgb;
      graphCtx.fillRect(graph.width - 1, 0, 1, 10);

      graphCtx.fillStyle = '#f00';
      graphCtx.fillRect(graph.width - 1, (1 - original.r) * graph.height / 2 + 10, 1, 1);
      graphCtx.fillStyle = '#0f0';
      graphCtx.fillRect(graph.width - 1, (1 - original.g) * graph.height / 2 + 10, 1, 1);
      graphCtx.fillStyle = '#00f';
      graphCtx.fillRect(graph.width - 1, (1 - original.b) * graph.height / 2 + 10, 1, 1);
    }

    if (isCalibrating) {
      calibration.train(sample);
    }

    const normalized = calibration.normalize(sample);

    if (!isCalibrating) {
      output.render(sample);

      const cssColor = `rgb(${sample.r * 255}, ${sample.g * 255}, ${sample.b * 255})`;

      graphCtx.fillStyle = cssColor;
      graphCtx.fillRect(graph.width - 1, graph.height / 2, 1, 10);
    }

    graphCtx.fillStyle = '#800';
    graphCtx.fillRect(graph.width - 1, (2 - sample.r) * graph.height / 2 + 20, 1, 1);
    graphCtx.fillStyle = '#080';
    graphCtx.fillRect(graph.width - 1, (2 - sample.g) * graph.height / 2 + 20, 1, 1);
    graphCtx.fillStyle = '#008';
    graphCtx.fillRect(graph.width - 1, (2 - sample.b) * graph.height / 2 + 20, 1, 1);

    graphCtx.fillStyle = '#f00';
    graphCtx.fillRect(graph.width - 1, (2 - normalized.r) * graph.height / 2 + 20, 1, 1);
    graphCtx.fillStyle = '#0f0';
    graphCtx.fillRect(graph.width - 1, (2 - normalized.g) * graph.height / 2 + 20, 1, 1);
    graphCtx.fillStyle = '#00f';
    graphCtx.fillRect(graph.width - 1, (2 - normalized.b) * graph.height / 2 + 20, 1, 1);

    // graphCtx.fillStyle = 'rgba(255, 0, 0, 1)';
    // graphCtx.fillRect(
    //   0, (2 - calibration.max.r) * graph.height / 2,
    //   3, (calibration.max.r - calibration.min.r) * graph.height / 2
    // );
    // graphCtx.fillStyle = 'rgba(0, 255, 0, 1)';
    // graphCtx.fillRect(
    //   3, (2 - calibration.max.g) * graph.height / 2,
    //   3, (calibration.max.g - calibration.min.g) * graph.height / 2
    // );
    // graphCtx.fillStyle = 'rgba(0, 0, 255, 1)';
    // graphCtx.fillRect(
    //   6, (2 - calibration.max.b) * graph.height / 2,
    //   3, (calibration.max.b - calibration.min.b) * graph.height / 2
    // );
  }

  requestAnimationFrame(nextFrame);
}

function *calibrationSignal(seconds) {
  const frames = seconds * 60;

  for (let i = 0; i < frames; i++) {
    const v = (Math.sin(i / frames * Math.PI * 6 - Math.PI / 2) + 1) / 2;
    yield {
      r: i < frames / 3 ? v : 0,
      g: i >= frames / 3 && i < frames * 2 / 3 ? v : 0,
      b: i >= frames * 2 / 3 ? v : 0
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

      function pasteImage() {
        const imageAspect = image.width / image.height;
        const inputAspect = input.width / input.height;

        if (imageAspect >= inputAspect) {
          const overflowWidth = input.height * image.width / image.height;

          inputCtx.drawImage(
            image,
            (input.width - overflowWidth) / 2, 0, overflowWidth, input.height
          );
        } else {
          const overflowHeight = input.width * image.height / image.width;

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

        inputCtx.globalCompositeOperation = 'difference';
        inputCtx.fillStyle = `hsl(0, 0%, ${(Math.random() / 2 + 0.5) * 100}%)`;

        inputCtx.fillRect(x, 0, 1, input.height);
        inputCtx.fillRect(0, y, input.width, 1);

        inputCtx.globalCompositeOperation = 'source-over';
        inputCtx.fillStyle = '#fff';

        inputCtx.fillRect(x, y, 1, 1);
      }));
    };

    image.src = url;
  });
}

function $(selector) {
  return document.querySelector(selector);
}

async function init() {
  const emitter = new Emitter($('#emitter'));
  const receiver = new Receiver($('#camera'), $('#pixel'));
  const output = new Output($('#output'));

  await receiver.init();

  $('#transmit').addEventListener('click', async () => {
    const imageUrl = 'patterns/tv-test-patterns-02.jpeg';
    const iterator = scanlineIterator;

    const imageSignal = await loadImage(imageUrl, iterator);

    output.init(iterator);

    calibration.reset();

    signals = [];

    signals.push({signal: calibrationSignal(5), isCalibrating: true});
    // signals.push({signal: delay(0.5)});
    signals.push({signal: imageSignal});
  });

  $('#fullscreen').addEventListener('click', () => {
    document.body.requestFullscreen({
      navigationUI: 'hide'
    });
  });

  process(emitter, receiver, output);
}

window.addEventListener('load', init);
