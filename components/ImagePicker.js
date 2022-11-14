export class ImagePicker {
  /**
   * @param {HTMLDivElement} div
   * @param {string[]} presetUrls
   */
  constructor(div, presetUrls) {
    this.div = div;
    this.presetUrls = presetUrls.slice(0);
    this.selectedIdx = 0;

    this.ul = div.querySelector('ul');
    this.liTemplate = div.querySelector('#li-template')?.innerHTML;
    this.fileInput = /** @type {HTMLInputElement} */ (
      div.querySelector('#file')
    );

    this.fileInput?.addEventListener('change', (event) => {
      if (!this.fileInput.value) {
        return;
      }

      const data = new FormData(
        /** @type {HTMLFormElement} */ (this.fileInput?.form)
      );
      const url = URL.createObjectURL(/** @type {any} */ (data.get('file')));

      this.presetUrls.push(url);
      this.selectedIdx = this.presetUrls.length - 1;

      this.render();
    });

    this.render();
  }

  render() {
    const presetsHtml = this.presetUrls
      .map((presetUrl, idx) => {
        /**
         * @type {{[key: string]: string}}
         */
        const preset = {
          url: presetUrl,
          checked: idx === this.selectedIdx ? 'checked' : '',
        };
        return this.liTemplate?.replace(
          /\{([^}]+)\}/g,
          (_, key) => preset[key]
        );
      })
      .join('\n');

    // @ts-ignore
    this.ul.innerHTML = presetsHtml;
  }
}
