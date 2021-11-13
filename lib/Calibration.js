import {Color} from '../lib/Color.js';

/**
 * @param {number} seconds
 */
function* calibrationSignal(seconds) {
  const frames = seconds * 60;

  for (let i = 0; i < frames; i++) {
    const v = (Math.sin((i / frames) * Math.PI * 6 - Math.PI / 2) + 1) / 2;
    yield new Color({
      r: i < frames / 3 ? v : 0,
      g: i >= frames / 3 && i < (frames * 2) / 3 ? v : 0,
      b: i >= (frames * 2) / 3 ? v : 0,
    });
  }
}

/**
 * @param {number} value
 */
function clamp(value) {
  return Math.max(0, Math.min(1, value));
}

export class Calibration {
  /**
   * @param {number} seconds
   */
  init(seconds) {
    this.min = {r: 1, g: 1, b: 1};
    this.max = {r: 0, g: 0, b: 0};

    return calibrationSignal(seconds);
  }

  /**
   * @param {Color} color
   */
  train(color) {
    this.min = {
      r: Math.min(this.min.r, color.r),
      g: Math.min(this.min.g, color.g),
      b: Math.min(this.min.b, color.b),
    };
    this.max = {
      r: Math.max(this.max.r, color.r),
      g: Math.max(this.max.g, color.g),
      b: Math.max(this.max.b, color.b),
    };
  }

  /**
   * @param {Color} color
   */
  normalize(color) {
    return new Color({
      r: clamp((color.r - this.min.r) / (this.max.r - this.min.r) + this.min.r),
      g: clamp((color.g - this.min.g) / (this.max.g - this.min.g) + this.min.g),
      b: clamp((color.b - this.min.b) / (this.max.b - this.min.b) + this.min.b),
    });
  }
}
