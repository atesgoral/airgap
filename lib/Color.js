export class Color {
  constructor({r = 0, g = 0, b = 0}) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  toCss() {
    return `rgb(${this.r * 255}, ${this.g * 255}, ${this.b * 255})`;
  }
}
