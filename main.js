import {Emitter} from './Emitter.js';
import {Receiver} from './Receiver.js';
import {Input} from './Input.js';
import {Output} from './Output.js';
import {Calibration} from './Calibration.js';
import {Graph} from './Graph.js';

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

function process(emitter, receiver, output, calibration, graph) {
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

    graph.advance();

    if (original !== null) {

      emitter.emit(original);

      graph.plot(original, 0, 10);

      graph.plot({r: 1}, (1 - original.r) * graph.height / 2 + 10);
      graph.plot({g: 1}, (1 - original.g) * graph.height / 2 + 10);
      graph.plot({b: 1}, (1 - original.b) * graph.height / 2 + 10);
    }

    if (isCalibrating) {
      calibration.train(sample);
    }

    const normalized = calibration.normalize(sample);

    if (!isCalibrating) {
      output.render(sample);

      graph.plot(sample, graph.height / 2, 10);
    }

    graph.plot({r: 0.5}, (2 - sample.r) * graph.height / 2 + 20);
    graph.plot({g: 0.5}, (2 - sample.g) * graph.height / 2 + 20);
    graph.plot({b: 0.5}, (2 - sample.b) * graph.height / 2 + 20);

    graph.plot({r: 1}, (2 - normalized.r) * graph.height / 2 + 20);
    graph.plot({g: 1}, (2 - normalized.g) * graph.height / 2 + 20);
    graph.plot({b: 1}, (2 - normalized.b) * graph.height / 2 + 20);
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
  const graph = new Graph($('#graph'));

  await receiver.init();

  $('#transmit').addEventListener('click', async () => {
    const imageUrl = 'patterns/tv-test-patterns-02.jpeg';
    const iterator = scanlineIterator;

    const calibrationSignal = calibration.init(5);
    const imageSignal = await input.init(imageUrl, iterator);

    output.init(iterator);
    graph.init();

    signals = [
      {signal: calibrationSignal, isCalibrating: true},
      //{signal: delay(0.5)},
      {signal: imageSignal}
    ];
  });

  $('#fullscreen').addEventListener('click', () => {
    document.body.requestFullscreen({navigationUI: 'hide'});
  });

  process(emitter, receiver, output, calibration, graph);
});
