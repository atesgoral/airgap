export class Status {
  /**
   * @param {HTMLDivElement} div
   */
  constructor(div) {
    this.div = div;
  }

  /**
   * @param {string} status
   */
  set(status) {
    this.div.innerHTML = status;
  }
}
