export class Color {
  /**
   * @param {{r?: number, g?: number, b?: number}} components
   */
  constructor({r = 0, g = 0, b = 0}) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  /**
   * @returns {string}
   */
  toCss() {
    return `rgb(${this.r * 255}, ${this.g * 255}, ${this.b * 255})`;
  }

  static BLACK = new Color({});
  static WHITE = new Color({r: 1, g: 1, b: 1});
}
