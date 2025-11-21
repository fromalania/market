/* js/reviews-utils.js
   UMD-модуль: работает и в браузере (window.ReviewUtils), и в Node/Jest (module.exports)
*/
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ReviewUtils = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  "use strict";

  /**
   * Средняя оценка по массиву чисел/строк
   * @param {Array<number|string>} list
   * @returns {number} округлено до 1 знака, 0 если нет оценок
   */
  function calculateAverageRating(list) {
    if (!Array.isArray(list) || list.length === 0) return 0;
    const nums = list
      .map(n => Number(n))
      .filter(n => Number.isFinite(n) && n >= 1 && n <= 5);

    if (nums.length === 0) return 0;
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    return Math.round(avg * 10) / 10; // 1 знак после запятой
  }

  /**
   * Валидация полей отзыва
   * @param {{name:string, rating:number|string, text:string}} data
   * @returns {{ok:boolean, error?:string}}
   */
  function validateReview(data) {
    if (!data) return { ok: false, error: 'no data' };
    const name = String(data.name || '').trim();
    const text = String(data.text || '').trim();
    const rating = Number(data.rating);

    if (name.length < 2) return { ok: false, error: 'name too short' };
    if (!(rating >= 1 && rating <= 5)) return { ok: false, error: 'bad rating' };
    if (text.length < 5) return { ok: false, error: 'text too short' };
    return { ok: true };
  }

  return {
    calculateAverageRating,
    validateReview
  };
});
