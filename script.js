/* =========================================================
   Эко-Маркет — общий скрипт (карточка товара, отзывы, события)
   Полная замена содержимого файла.
   ========================================================= */

/* ---------- Вспомогательное ----------- */
window.dataLayer = window.dataLayer || [];

function getProductId() {
  const url = new URL(window.location.href);
  // поддержим вариант product.html?id=123
  return url.searchParams.get('id') || document.body.dataset.productId || 'no-id';
}
function getProductName() {
  return document.body.dataset.productName || (document.querySelector('h1')?.textContent?.trim()) || 'unknown';
}
function getProductPrice() {
  const raw = document.body.dataset.productPrice || '';
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ---------- Событие add_to_cart ---------- */
(function trackAddToCart() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-to-cart], .add-to-cart, .btn-to-cart, .btn[data-action="add-to-cart"]');
    if (!btn) return;

    // Берём данные товара из ближайшего контейнера, иначе из <body>
    const container = btn.closest('[data-product-id]') || document.body;

    const product_id   = container.dataset.productId   || getProductId();
    const product_name = container.dataset.productName || getProductName();
    const price        = Number(container.dataset.productPrice || getProductPrice() || 0) || null;

    // Пушим в dataLayer — GTM подхватит
    window.dataLayer.push({
      event: 'add_to_cart',
      product_id,
      product_name,
      price
    });

    // Небольшой UX
    try {
      if (product_name) alert(`Добавлено в корзину: ${product_name}`);
    } catch (_) {}
  });
})();

/* ---------- Отзывы: хранение в localStorage ---------- */
function reviewsKey() {
  return `reviews_${getProductId()}`;
}
function loadReviews() {
  try { return JSON.parse(localStorage.getItem(reviewsKey())) || []; }
  catch { return []; }
}
function saveReviews(list) {
  localStorage.setItem(reviewsKey(), JSON.stringify(list));
}

function renderReviews() {
  const ul = document.getElementById('reviewsList');
  if (!ul) return;

  const list = loadReviews();
  ul.innerHTML = '';

  if (!list.length) {
    ul.innerHTML = '<li class="reviews__empty">Пока нет отзывов — станьте первым!</li>';
    return;
  }

  list.forEach(r => {
    const li = document.createElement('li');
    li.className = 'reviews__item';
    li.innerHTML = `
      <div class="reviews__head">
        <strong class="reviews__name">${escapeHtml(r.name)}</strong>
        <span class="reviews__rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
      </div>
      <div class="reviews__text">${escapeHtml(r.text)}</div>
      <time class="reviews__date" datetime="${new Date(r.ts).toISOString()}">
        ${new Date(r.ts).toLocaleDateString()}
      </time>
    `;
    ul.appendChild(li);
  });
}

function initReviewForm() {
  const form = document.getElementById('reviewForm');
  const ok = document.getElementById('reviewSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const rating = Number(form.rating.value);
    const text = form.text.value.trim();

    if (!name || !rating || !text) return;

    const reviews = loadReviews();
    reviews.unshift({ name, rating, text, ts: Date.now() }); // новый — наверх
    saveReviews(reviews);
    renderReviews();

    form.reset();
    if (ok) { ok.hidden = false; setTimeout(() => ok.hidden = true, 3000); }

    // GA4/GTM событие — можно отлавливать в Tag Assistant
    window.dataLayer.push({
      event: 'review_submitted',
      product_id: getProductId(),
      rating: rating,
      source: 'onsite'
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderReviews();
  initReviewForm();
});

/* ---------- (Опционально) событие клика по фильтрам каталога ----------
   Если на catalog.html у кнопок/ссылок есть data-filter="price_asc" и т.п.,
   этот блок зафиксирует клики. Ничего не ломает на других страницах. */
document.addEventListener('click', (e) => {
  const f = e.target.closest('[data-filter]');
  if (!f) return;
  window.dataLayer.push({ event: 'filter_click', filter: f.dataset.filter });
});
