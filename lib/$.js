/**
 * @template T
 * @param {string} selector
 * @param {Element | Document} parent
 */
export function $(selector, parent = document) {
  const el = /** @type {unknown} */ (parent.querySelector(selector));
  if (!el) {
    throw new Error('Element not found');
  }
  return /** @type {T} */ (el);
}
