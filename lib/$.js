/**
 * @param {string} selector
 */
export function $(selector) {
  const domNode = document.querySelector(selector);

  if (!domNode) {
    throw new Error('Element not found');
  }

  return {
    get: () => domNode,
    /**
     * @param {EventListener} callback
     */
    click: (callback) => domNode.addEventListener('click', callback),
    disable: () => domNode.setAttribute('disabled', ''),
    enable: () => domNode.removeAttribute('disabled'),
  };
}
