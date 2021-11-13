import {Color} from '../lib/Color.js';

/**
 * @param {number} seconds
 */
function* timingSignal(seconds) {
  const frames = seconds * 60;

  for (let i = 0; i < frames; i++) {
    const v = ~~(i === 0);

    yield new Color({
      r: v,
      g: v,
      b: v,
    });
  }
}

export class Timing {
  /**
   * @param {number} seconds
   */
  init(seconds) {
    this.frameCounter = 0;
    this.peakMag = 0;
    this.peakFrame = 0;

    return timingSignal(seconds);
  }

  /**
   * @param {Color} color
   */
  train(color) {
    const mag = Math.hypot(color.r, color.g, color.b);

    if (mag > /** @type {number} */ (this.peakMag)) {
      this.peakMag = mag;
      this.peakFrame = this.frameCounter;
    }

    this.frameCounter = /** @type {number} */ (this.frameCounter++) + 1;
  }

  wait() {
    if (this.peakFrame) {
      this.peakFrame--;
      return true;
    } else {
      return false;
    }
  }
}
