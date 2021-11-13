import {Color} from '../lib/Color.js';

/**
 * @param {number} seconds
 */
function* timingSignal(seconds) {
  const frames = seconds * 60;

  for (let i = 0; i < frames; i++) {
    yield i > 0 ? Color.BLACK : Color.WHITE;
  }
}

export class Timing {
  /** @private */
  frameCounter = 0;
  /** @private */
  peakMag = 0;
  /** @private */
  peakFrame = 0;

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

    if (mag > this.peakMag) {
      this.peakMag = mag;
      this.peakFrame = this.frameCounter;
    }

    this.frameCounter++;
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
