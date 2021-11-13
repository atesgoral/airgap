/** @typedef {'LOADING' | 'READY' | 'TIMING' | 'CALIBRATING' | 'TRANSMITTING'} State */

export class Status {
  /**
   * @param {HTMLPreElement} pre
   */
  constructor(pre) {
    this.pre = pre;
    /** @type {State} */
    this.state = 'LOADING';
    this.update();
  }

  /**
   * @param {State} state
   */
  set(state) {
    this.state = state;
    this.update();
  }

  /** @private */
  update() {
    const lines = [];

    switch (this.state) {
      case 'LOADING':
        lines.push('Loading...');
        break;
      case 'READY':
        lines.push('Ready.');
        break;
      case 'TIMING':
        lines.push('Timing...');
        break;
      case 'CALIBRATING':
        lines.push('Calibrating...');
        break;
      case 'TRANSMITTING':
        lines.push('Transmitting...');
        break;
    }

    this.pre.innerHTML = lines.join('\n');
  }
}
