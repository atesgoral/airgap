import {Canvas} from './Canvas.js';

export class Emitter extends Canvas {
  emit(color) {
    this.fill(color);
  }
}
