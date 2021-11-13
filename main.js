import {$} from './lib/$.js';
import {raf} from './lib/raf.js';
import * as scanners from './lib/scanners.js';
import {Calibration} from './lib/Calibration.js';

import {Emitter} from './components/Emitter.js';
import {Camera} from './components/Camera.js';
import {Pixel} from './components/Pixel.js';
import {Input} from './components/Input.js';
import {Output} from './components/Output.js';
import {Graph} from './components/Graph.js';
import {Timing} from './lib/Timing.js';

/** @typedef {import('./lib/Color.js').Color} Color */

// const imageUrl = 'patterns/kodim23.png';
const imageUrl = 'patterns/Philips_PM5544.svg.png';

window.addEventListener('load', async () => {
  const emitter = new Emitter(
    /** @type {HTMLCanvasElement} */ ($('#emitter').get())
  );
  const camera = new Camera(
    /** @type {HTMLCanvasElement} */ ($('#camera').get())
  );
  const pixel = new Pixel(/** @type {HTMLCanvasElement} */ ($('#pixel').get()));
  const input = new Input(/** @type {HTMLCanvasElement} */ ($('#input').get()));
  const output = new Output(
    /** @type {HTMLCanvasElement} */ ($('#output').get())
  );
  const timing = new Timing();
  const calibration = new Calibration();
  const inputGraph = new Graph(
    /** @type {HTMLCanvasElement} */ ($('#input-graph').get())
  );
  const outputGraph = new Graph(
    /** @type {HTMLCanvasElement} */ ($('#output-graph').get())
  );

  await camera.init();

  $('#transmit').enable();

  /** @type {Array<{signal: Generator<Color>; isTiming?: boolean; isCalibrating?: boolean}>} */
  let signals = [];

  $('#transmit').click(async () => {
    $('#transmit').disable();

    const scanner = scanners.raster;

    output.init(scanner);

    inputGraph.init();
    outputGraph.init();

    signals = [
      {signal: timing.init(1), isTiming: true},
      {signal: calibration.init(5), isCalibrating: true},
      {signal: await input.init(imageUrl, scanner)},
    ];

    $('#transmit').enable();
  });

  $('#fullscreen').click(async () => {
    $('#fullscreen').disable();
    await document.body.requestFullscreen({navigationUI: 'hide'});
    $('#fullscreen').enable();
  });

  raf(() => {
    inputGraph.advance();
    outputGraph.advance();

    camera.snapshot();
    pixel.stretchImage(camera.canvas);

    if (!signals.length) {
      return;
    }

    const sample = pixel.read();

    const {signal, isTiming, isCalibrating} = signals[0];
    const {value: original, done} = signal.next();

    if (done) {
      signals.shift();
      return;
    }

    emitter.emit(original);
    inputGraph.plot(original);

    if (isTiming) {
      timing.train(sample);
      outputGraph.plot(sample);
    } else if (isCalibrating) {
      calibration.train(sample);
      outputGraph.plot(sample);
    } else if (!timing.wait()) {
      const normalized = calibration.normalize(sample);
      output.render(normalized);
      outputGraph.plot(normalized);
    }
  });
});
