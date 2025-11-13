// ---------- РЕДИРЕКТЫ С УСТАРЕВШИХ URL ----------
// Для статического сайта на GitHub Pages используем таблицу редиректов в JS.
// Если пользователь заходит на старый адрес, его автоматически перенаправляет
// на актуальную страницу.

(function () {
  if (typeof window === "undefined") return;

  const redirectMap = {
    // старый URL : новый URL
    "/market/old-product.html": "/market/product.html",
    "/market/old-catalog.html": "/market/catalog.html",
    "/market/old-home.html": "/market/index.html"
  };

  const path = window.location.pathname;
  if (redirectMap[path]) {
    window.location.replace(redirectMap[path]);
  }
})();

// ---------- ДАННЫЕ О ТОВАРАХ ----------

const PRODUCTS = {
  bottle: {
    id: "bottle",
    name: "Многоразовая бутылка «Forest» 500 мл",
    price: 990
  },
  shopper: {
    id: "shopper",
    name: "Хлопковый шоппер «Leaf»",
    price: 590
  },
  containers: {
    id: "containers",
    name: "Набор многоразовых контейнеров",
    price: 1490
  }
};

// ---------- РАБОТА С КОРЗИНОЙ В localStorage ----------

const CART_KEY = "eco_market_cart";

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(productId) {
  const cart = getCart();
  const item = cart.find((p) => p.id === productId);
  if (item) {
    item.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
  showToast("Товар добавлен в корзину");
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => {
    const product = PRODUCTS[item.id];
    return product ? sum + product.price * item.qty : sum;
  }, 0);
}

function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  el.textContent = count;
}

// ---------- НЕБОЛЬШОЕ УВЕДОМЛЕНИЕ (ВМЕСТО alert) ----------

function showToast(message) {
  let toast = document.getElementById("eco-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "eco-toast";
    toast.style.position = "fixed";
    toast.style.right = "16px";
    toast.style.bottom = "16px";
    toast.style.maxWidth = "260px";
    toast.style.padding = "10px 14px";
    toast.style.borderRadius = "12px";
    toast.style.background = "rgba(15,118,110,0.95)";
    toast.style.color = "#ecfeff";
    toast.style.fontSize = "14px";
    toast.style.zIndex = "9999";
    toast.style.boxShadow = "0 8px 20px rgba(15,118,110,0.5)";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2200);
}

// ---------- ИНИЦИАЛИЗАЦИЯ НА СТРАНИЦАХ ----------

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  initAddToCartButtons();
  initCatalogFilters();
  renderCartPage();
  renderCheckoutPage();
  initFeedbackForm();
  initCheckoutForm();
});

// Кнопки "Добавить в корзину" на каталоге и карточке товара
function initAddToCartButtons() {
  const buttons = document.querySelectorAll(".add-to-cart");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.product;
      if (!id) return;
      addToCart(id);
    });
  });

  const detailBtn = document.getElementById("add-to-cart-detail");
  if (detailBtn) {
    detailBtn.addEventListener("click", () => {
      const id = detailBtn.dataset.product;
      if (!id) return;
      addToCart(id);
    });
  }
}

// Фильтры и поиск на странице catalog.html
function initCatalogFilters() {
  const filterSelect = document.getElementById("category-filter");
  const searchInput = document.getElementById("search-input");
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".product-card"));

  function applyFilters() {
    const category = filterSelect ? filterSelect.value : "all";
    const query = (searchInput ? searchInput.value : "").toLowerCase();

    cards.forEach((card) => {
      const cardCategory = card.dataset.category || "all";
      const text = card.textContent.toLowerCase();
      const matchCategory = category === "all" || cardCategory === category;
      const matchSearch = !query || text.includes(query);

      card.style.display = matchCategory && matchSearch ? "" : "none";
    });
  }

  if (filterSelect) filterSelect.addEventListener("change", applyFilters);
  if (searchInput) searchInput.addEventListener("input", applyFilters);
}

// Отрисовка корзины на cart.html
function renderCartPage() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!container || !totalEl) return;

  const cart = getCart();
  container.innerHTML = "";

  if (!cart.length) {
    container.textContent = "Ваша корзина пуста. Добавьте товары из каталога.";
    totalEl.textContent = "0 ₽";
    return;
  }

  cart.forEach((item) => {
    const product = PRODUCTS[item.id];
    if (!product) return;

    const row = document.createElement("div");
    row.className = "cart-row";
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.alignItems = "center";
    row.style.marginBottom = "8px";

    const title = document.createElement("span");
    title.textContent = `${product.name} × ${item.qty}`;

    const price = document.createElement("span");
    price.textContent = `${product.price * item.qty} ₽`;

    row.appendChild(title);
    row.appendChild(price);
    container.appendChild(row);
  });

  totalEl.textContent = `${getCartTotal()} ₽`;
}

// Отрисовка заказа на checkout.html
function renderCheckoutPage() {
  const itemsContainer = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");
  if (!itemsContainer || !totalEl) return;

  const cart = getCart();
  itemsContainer.innerHTML = "";

  if (!cart.length) {
    itemsContainer.textContent = "Корзина пуста. Вернитесь в каталог и добавьте товары.";
    totalEl.textContent = "0 ₽";
    return;
  }

  cart.forEach((item) => {
    const product = PRODUCTS[item.id];
    if (!product) return;

    const row = document.createElement("div");
    row.className = "checkout-row";
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.marginBottom = "6px";

    const title = document.createElement("span");
    title.textContent = `${product.name} × ${item.qty}`;

    const price = document.createElement("span");
    price.textContent = `${product.price * item.qty} ₽`;

    row.appendChild(title);
    row.appendChild(price);
    itemsContainer.appendChild(row);
  });

  totalEl.textContent = `${getCartTotal()} ₽`;
}

// Обратная связь на главной
function initFeedbackForm() {
  const form = document.getElementById("feedback-form");
  const status = document.getElementById("form-status");
  if (!form || !status) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "Сообщение отправлено (учебный пример, без реальной отправки).";
  });
}

// Оформление заказа
function initCheckoutForm() {
  const form = document.getElementById("checkout-form");
  const status = document.getElementById("checkout-status");
  if (!form || !status) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const cart = getCart();
    if (!cart.length) {
      status.textContent = "Корзина пуста. Добавьте товары перед оформлением заказа.";
      return;
    }

    // В реальном проекте здесь отправлялись бы данные на сервер
    status.textContent = "Заказ подтверждён (учебный пример). Сейчас вы будете перенаправлены...";
    setTimeout(() => {
      saveCart([]); // очищаем корзину
      window.location.href = "thankyou.html";
    }, 1200);
  });
}
