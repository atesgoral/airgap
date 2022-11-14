import {$} from '../lib/$.js';
import {Button} from './Button.js';

export class ImagePicker {
  /**
   * @param {HTMLDivElement} div
   * @param {string[]} presetUrls
   */
  constructor(div, presetUrls) {
    this.div = div;
    this.presetUrls = presetUrls.slice(0);
    this.selectedIdx = 0;

    this.ul = $('ul', div);
    this.liTemplate = $('#li-template', div).innerHTML;
    this.fileInput = $('#file', div);

    this.ok = new Button($('#ok', div));

    this.ul.addEventListener('change', (event) => {
      const idx = parseInt(event.srcElement.getAttribute('data-idx'), 10);
      this.selectedIdx = idx;
    });

    this.fileInput.addEventListener('change', () => {
      if (!this.fileInput.value) {
        return;
      }

      const data = new FormData(
        /** @type {HTMLFormElement} */ (this.fileInput.form)
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
          idx: idx.toString(),
          url: presetUrl,
          checked: idx === this.selectedIdx ? 'checked' : '',
        };
        return this.liTemplate.replace(/\{([^}]+)\}/g, (_, key) => preset[key]);
      })
      .join('\n');

    // @ts-ignore
    this.ul.innerHTML = presetsHtml;
  }

  /**
   * @param {(url: string) => void} callback
   */
  onSelect(callback) {
    this.ok.onClick(() => {
      const selectedImg = $(
        `li:nth-child(${this.selectedIdx + 1}) img`,
        this.ul
      );
      callback(selectedImg.src);
    });
  }
}
