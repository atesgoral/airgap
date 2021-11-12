/**
 * @param {FrameRequestCallback} callback
 */
export function raf(callback) {
  /**
   * @param {DOMHighResTimeStamp} time
   */
  function nextFrame(time) {
    requestAnimationFrame(nextFrame);
    callback(time);
  }

  requestAnimationFrame(nextFrame);
}
