export function $(selector) {
  const domNode = document.querySelector(selector);

  return {
    get: () => domNode,
    click: (callback) => domNode.addEventListener('click', callback),
  };
}
