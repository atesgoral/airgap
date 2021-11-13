export class Button {
  /**
   * @param {HTMLButtonElement} button
   */
  constructor(button) {
    this.button = button;
  }

  /**
   * @param {string} title
   */
  setTitle(title) {
    this.button.innerHTML = title;
  }

  /**
   * @param {EventListener} callback
   */
  onClick(callback) {
    this.button.addEventListener('click', callback);
  }

  disable() {
    this.button.setAttribute('disabled', '');
  }

  enable() {
    this.button.removeAttribute('disabled');
  }
}
