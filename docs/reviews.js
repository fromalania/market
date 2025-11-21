/* reviews.js
   Простой «контроллер» отзывов для статического сайта.
   Сохраняем отзывы в localStorage и пересчитываем средний рейтинг товара.
*/

const STORAGE_KEY = 'eco_reviews_v1';

function readAllReviews() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) {
    console.warn('readAllReviews: parse error', e);
    return {};
  }
}

function writeAllReviews(obj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

export function getReviews(productId) {
  const all = readAllReviews();
  return all[productId] || [];
}

export function addReview(productId, rating, comment) {
  const all = readAllReviews();

  if (!all[productId]) {
    all[productId] = [];
  }

  all[productId].push({
    rating: Number(rating),
    comment: comment?.trim() || '',
    createdAt: new Date().toISOString()
  });

  writeAllReviews(all);

  const list = all[productId];
  const sum = list.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  const avg = list.length ? +(sum / list.length).toFixed(1) : 0;

  const targetEl = document.querySelector(`[data-rating-target="${productId}"]`);
  if (targetEl) {
    targetEl.textContent = String(avg);
  }

  return avg;
}

export function initProductReviewsUI(productId) {
  const list = getReviews(productId);

  const sum = list.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  const avg = list.length ? +(sum / list.length).toFixed(1) : 0;
  const targetEl = document.querySelector(`[data-rating-target="${productId}"]`);
  if (targetEl) targetEl.textContent = String(avg);

  const container = document.querySelector('[data-reviews-list]');
  if (container) {
    container.innerHTML = '';
    list.forEach(r => {
      const item = document.createElement('div');
      item.className = 'review-item';
      item.innerHTML = `
        <div class="review-rating">Оценка: <b>${r.rating}</b></div>
        <div class="review-comment">${r.comment ? escapeHTML(r.comment) : '<i>без комментария</i>'}</div>
        <div class="review-date">${new Date(r.createdAt).toLocaleString()}</div>
      `;
      container.appendChild(item);
    });
  }
}

function escapeHTML(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
