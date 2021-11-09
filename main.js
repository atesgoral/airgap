import {$} from './lib/$.js';
import {Calibration} from './lib/Calibration.js';
import {Color} from './lib/Color.js';

import {Emitter} from './components/Emitter.js';
import {Camera} from './components/Camera.js';
import {Pixel} from './components/Pixel.js';
import {Input} from './components/Input.js';
import {Output} from './components/Output.js';
import {Graph} from './components/Graph.js';

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

function process(emitter, camera, pixel, output, calibration, graph) {
  function nextFrame(t) {
    requestAnimationFrame(nextFrame);

    camera.snapshot();

    pixel.stretchImage(camera.canvas);

    const sample = pixel.read();

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

      graph.plot(new Color({r: 1}), (1 - original.r) * graph.height / 2 + 10);
      graph.plot(new Color({g: 1}), (1 - original.g) * graph.height / 2 + 10);
      graph.plot(new Color({b: 1}), (1 - original.b) * graph.height / 2 + 10);
    }

    if (isCalibrating) {
      calibration.train(sample);
    }

    const normalized = calibration.normalize(sample);

    if (!isCalibrating) {
      output.render(sample);

      graph.plot(sample, graph.height / 2, 10);
    }

    graph.plot(new Color({r: 0.5}), (2 - sample.r) * graph.height / 2 + 20);
    graph.plot(new Color({g: 0.5}), (2 - sample.g) * graph.height / 2 + 20);
    graph.plot(new Color({b: 0.5}), (2 - sample.b) * graph.height / 2 + 20);

    graph.plot(new Color({r: 1}), (2 - normalized.r) * graph.height / 2 + 20);
    graph.plot(new Color({g: 1}), (2 - normalized.g) * graph.height / 2 + 20);
    graph.plot(new Color({b: 1}), (2 - normalized.b) * graph.height / 2 + 20);
  }

  requestAnimationFrame(nextFrame);
}

function *delay(seconds) {
  const frames = seconds * 60;

  for (let i = 0; i < frames; i++) {
    yield null;
  }
}

window.addEventListener('load', async () => {
  const emitter = new Emitter($('#emitter').get());
  const camera = new Camera($('#camera').get());
  const pixel = new Pixel($('#pixel').get());
  const input = new Input($('#input').get());
  const output = new Output($('#output').get());
  const calibration = new Calibration();
  const graph = new Graph($('#graph').get());

  await camera.init();

  $('#transmit').click(async () => {
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

  $('#fullscreen').click(() => {
    document.body.requestFullscreen({navigationUI: 'hide'});
  });

  process(emitter, camera, pixel, output, calibration, graph);
});
