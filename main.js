import {Emitter} from './Emitter.js';
import {Receiver} from './Receiver.js';
import {Input} from './Input.js';
import {Output} from './Output.js';
import {Calibration} from './Calibration.js';

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

function process(emitter, receiver, output, calibration) {
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

function *delay(seconds) {
  const frames = seconds * 60;

  for (let i = 0; i < frames; i++) {
    yield null;
  }
}

function $(selector) {
  return document.querySelector(selector);
}

window.addEventListener('load', async () => {
  const emitter = new Emitter($('#emitter'));
  const receiver = new Receiver($('#camera'), $('#pixel'));
  const input = new Input($('#input'));
  const output = new Output($('#output'));
  const calibration = new Calibration();

  await receiver.init();

  $('#transmit').addEventListener('click', async () => {
    const imageUrl = 'patterns/tv-test-patterns-02.jpeg';
    const iterator = scanlineIterator;

    const calibrationSignal = calibration.init(5);
    const imageSignal = await input.init(imageUrl, iterator);

    output.init(iterator);

    signals = [
      {signal: calibrationSignal, isCalibrating: true},
      //{signal: delay(0.5)},
      {signal: imageSignal}
    ];
  });

  $('#fullscreen').addEventListener('click', () => {
    document.body.requestFullscreen({navigationUI: 'hide'});
  });

  process(emitter, receiver, output, calibration);
});
