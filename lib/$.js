/**
 * @template T
 * @param {string} selector
 */
export function $(selector) {
  const el = /** @type {unknown} */ (document.querySelector(selector));
  if (!el) {
    throw new Error('Element not found');
  }
  return /** @type {T} */ (el);
}
