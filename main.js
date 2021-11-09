import {$} from './lib/$.js';
import * as scanners from './lib/scanners.js';
import {Calibration} from './lib/Calibration.js';

import {Emitter} from './components/Emitter.js';
import {Camera} from './components/Camera.js';
import {Pixel} from './components/Pixel.js';
import {Input} from './components/Input.js';
import {Output} from './components/Output.js';
import {Graph} from './components/Graph.js';

window.addEventListener('load', async () => {
  const emitter = new Emitter($('#emitter').get());
  const camera = new Camera($('#camera').get());
  const pixel = new Pixel($('#pixel').get());
  const input = new Input($('#input').get());
  const output = new Output($('#output').get());
  const calibration = new Calibration();
  const inputGraph = new Graph($('#input-graph').get());
  const outputGraph = new Graph($('#output-graph').get());

  await camera.init();

  let signals = [];

  $('#transmit').click(async () => {
    const imageUrl = 'patterns/tv-test-patterns-02.jpeg';
    const scanner = scanners.raster;

    const calibrationSignal = calibration.init(5);
    const imageSignal = await input.init(imageUrl, scanner);

    output.init(scanner);

    inputGraph.init();
    outputGraph.init();

    signals = [
      {signal: calibrationSignal, isCalibrating: true},
      {signal: imageSignal}
    ];
  });

  $('#fullscreen').click(() => {
    document.body.requestFullscreen({navigationUI: 'hide'});
  });

  function nextFrame() {
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

    inputGraph.advance();
    outputGraph.advance();

    if (original !== null) {
      emitter.emit(original);
      inputGraph.plot(original);
    }

    if (isCalibrating) {
      calibration.train(sample);
      outputGraph.plot(sample);
    } else {
      const normalized = calibration.normalize(sample);
      output.render(normalized);
      outputGraph.plot(normalized);
    }
  }

  requestAnimationFrame(nextFrame);
});
