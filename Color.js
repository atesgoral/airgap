export class Color {
  constructor({r, g, b}) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  toCss() {
    return `rgb(
      ${(this.r || 0) * 255},
      ${(this.g || 0) * 255},
      ${(this.b || 0) * 255}
    )`;
  }
}
