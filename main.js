import {$} from './lib/$.js';
import {raf} from './lib/raf.js';
import * as scanners from './lib/scanners.js';
import {Timing} from './lib/Timing.js';
import {Calibration} from './lib/Calibration.js';

import {Status} from './components/Status.js';
import {Emitter} from './components/Emitter.js';
import {Camera} from './components/Camera.js';
import {Pixel} from './components/Pixel.js';
import {Input} from './components/Input.js';
import {Output} from './components/Output.js';
import {Graph} from './components/Graph.js';
import {Button} from './components/Button.js';

/** @typedef {import('./lib/Color.js').Color} Color */

// const imageUrl = 'patterns/kodim23.png';
const imageUrl = 'patterns/Philips_PM5544.svg.png';

window.addEventListener('load', async () => {
  const status = new Status($('#status'));
  const emitter = new Emitter($('#emitter'));
  const camera = new Camera($('#camera'));
  const pixel = new Pixel($('#pixel'));
  const input = new Input($('#input'));
  const output = new Output($('#output'));
  const inputGraph = new Graph($('#input-graph'));
  const outputGraph = new Graph($('#output-graph'));
  const transmit = new Button($('#transmit'));
  const fullscreen = new Button($('#fullscreen'));

  const timing = new Timing();
  const calibration = new Calibration();

  status.set('Initializing camera...');

  await camera.init();

  transmit.enable();

  status.set('Ready.');

  /** @type {Array<{signal: Generator<Color>; isTiming?: boolean; isCalibrating?: boolean}>} */
  let signals = [];
  let isFullscreen = false;

  transmit.onClick(async () => {
    if (signals.length) {
      transmit.setTitle('Transmit');
      signals = [];
      status.set('Stopped.');
      return;
    }

    transmit.disable();

    const scanner = scanners.raster;

    output.init(scanner);

    inputGraph.init();
    outputGraph.init();

    signals = [
      {signal: timing.init(1), isTiming: true},
      {signal: calibration.init(5), isCalibrating: true},
      {signal: await input.init(imageUrl, scanner)},
    ];

    transmit.setTitle('Stop');
    transmit.enable();
  });

  fullscreen.onClick(async () => {
    fullscreen.disable();

    if (isFullscreen) {
      await document.exitFullscreen();
    } else {
      await document.body.requestFullscreen({navigationUI: 'hide'});
    }

    isFullscreen = !isFullscreen;

    fullscreen.setTitle(isFullscreen ? 'Exit fullscreen' : 'Fullscreen');

    fullscreen.enable();
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

      if (!signals.length) {
        status.set('Done.');
      }

      return;
    }

    emitter.emit(original);
    inputGraph.plot(original);

    if (isTiming) {
      status.set('Timing...');
      timing.train(sample);
      outputGraph.plot(sample);
    } else if (isCalibrating) {
      status.set('Calibrating...');
      calibration.train(sample);
      outputGraph.plot(sample);
    } else if (!timing.wait()) {
      status.set('Transmitting...');
      const normalized = calibration.normalize(sample);
      output.plot(normalized);
      outputGraph.plot(normalized);
    }
  });
});
