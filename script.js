/* ======= Данные (демо) ======= */
const PRODUCTS = [
  {
    id: 1,
    title: "Бамбуковая щётка",
    desc: "Экологичная зубная щётка из бамбука.",
    price: 199,
    image: "https://picsum.photos/seed/bamboo/720/480"
  },
  {
    id: 2,
    title: "Эко-бутылка",
    desc: "Многоразовая бутылка из стекла 0.7 л.",
    price: 990,
    image: "https://picsum.photos/seed/bottle/720/480"
  },
  {
    id: 3,
    title: "Авоська",
    desc: "Хлопковая сумка-сетка для покупок.",
    price: 350,
    image: "https://picsum.photos/seed/bag/720/480"
  }
];

/* ======= Утилиты ======= */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const fmt = n => n.toLocaleString("ru-RU");

/* ======= Локальное хранилище отзывов ======= */
const STORAGE_KEY = "eco-reviews";
function loadReviews() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch { return {}; }
}
function saveReviews(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

/* ======= Страница товара ======= */
document.addEventListener("DOMContentLoaded", () => {
  const page = qs("#product-page");
  if (!page) return;

  // берем id из URL (?id=1). если нет — берём 1
  const url = new URL(location.href);
  const id  = Number(url.searchParams.get("id") || 1);

  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];

  // Заполняем карточку
  qs("#product-image").src       = product.image;
  qs("#product-image").alt       = product.title;
  qs("#product-title").textContent = product.title;
  qs("#product-desc").textContent  = product.desc;
  qs("#product-price").textContent = fmt(product.price) + " ₽";

  // Корзина (демо)
  qs("#add-to-cart").addEventListener("click", () => {
    alert("Добавлено в корзину: " + product.title);
  });

  // Рейтинг + отзывы
  const db = loadReviews();
  if (!db[id]) db[id] = []; // массив отзывов этого товара

  renderReviews(db[id]);
  renderAvg(db[id]);

  // Выбор рейтинга в форме
  const ratingButtons = qsa("#rating-input button");
  const ratingInput   = qs("#rating");
  function setActive(val) {
    ratingButtons.forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.val) <= val);
    });
  }
  ratingButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = Number(btn.dataset.val);
      ratingInput.value = val;
      setActive(val);
    });
  });
  setActive(Number(ratingInput.value));

  // Отправка формы
  qs("#review-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const author = qs("#author").value.trim();
    const text   = qs("#text").value.trim();
    const rating = Number(qs("#rating").value);

    if (!author || !text || rating < 1 || rating > 5) {
      alert("Проверьте корректность полей.");
      return;
    }

    const review = {
      author,
      text,
      rating,
      date: new Date().toISOString()
    };
    db[id].unshift(review);
    saveReviews(db);

    // очистить форму, перерисовать блоки
    e.target.reset();
    ratingInput.value = 5;
    setActive(5);
    renderReviews(db[id]);
    renderAvg(db[id]);
    alert("Спасибо! Ваш отзыв добавлен.");
  });

  function renderAvg(list) {
    const avg = list.length
      ? (list.reduce((s, r) => s + r.rating, 0) / list.length)
      : 0;
    // звёздочки
    qs("#avg-rating").innerHTML = stars(avg);
    // счётчик
    qs("#reviews-count").textContent =
      list.length ? `(${list.length} отзыва)` : "(отзывов пока нет)";
  }

  function renderReviews(list) {
    const ul = qs("#reviews-list");
    ul.innerHTML = "";
    const tpl = qs("#review-item-tpl").content;
    list.forEach(r => {
      const li = tpl.cloneNode(true);
      qs(".review-author", li).textContent = r.author;
      qs(".review-text", li).textContent   = r.text;
      qs(".review-stars", li).innerHTML    = stars(r.rating);
      qs(".review-date", li).textContent   = new Date(r.date)
        .toLocaleDateString("ru-RU");
      ul.appendChild(li);
    });
    if (!list.length) {
      ul.innerHTML = `<li class="muted">Пока нет отзывов — будьте первым!</li>`;
    }
  }

  function stars(value) {
    // value может быть дробным (например, 4.3)
    const full = Math.floor(value);
    const half = value - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "☆" : "") + "☆".repeat(empty - (half ? 0 : 0));
  }
});
