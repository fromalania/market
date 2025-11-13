// Простейшая логика для учебного проекта: "корзина" в localStorage

const PRODUCTS = {
    bottle: { id: 'bottle', name: 'Многоразовая бутылка «Forest» 500 мл', price: 990 },
    shopper: { id: 'shopper', name: 'Хлопковый шоппер «Leaf»', price: 590 },
    containers: { id: 'containers', name: 'Набор многоразовых контейнеров', price: 1490 },
};

function loadCart() {
    try {
        const raw = localStorage.getItem('eco_cart');
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

function saveCart(cart) {
    localStorage.setItem('eco_cart', JSON.stringify(cart));
}

function getCartCount(cart) {
    return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal(cart) {
    return Object.values(cart).reduce((sum, item) => sum + item.qty * item.price, 0);
}

function updateCartCount() {
    const cart = loadCart();
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        countEl.textContent = getCartCount(cart);
    }
}

function addToCart(productId) {
    const product = PRODUCTS[productId];
    if (!product) return;
    const cart = loadCart();
    if (!cart[productId]) {
        cart[productId] = { ...product, qty: 0 };
    }
    cart[productId].qty += 1;
    saveCart(cart);
    updateCartCount();
    alert('Товар добавлен в корзину (учебный пример).');
}

function renderCart() {
    const cart = loadCart();
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!container || !totalEl) return;

    const items = Object.values(cart);
    if (!items.length) {
        container.innerHTML = '<p>В корзине пока пусто.</p>';
        totalEl.textContent = '0 ₽';
        return;
    }

    container.innerHTML = '';
    items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <span>${item.name}</span>
            <span>${item.qty} шт × ${item.price} ₽</span>
        `;
        container.appendChild(row);
    });
    totalEl.textContent = getCartTotal(cart) + ' ₽';
}

function renderCheckoutSummary() {
    const cart = loadCart();
    const container = document.getElementById('checkout-items');
    const totalEl = document.getElementById('checkout-total');
    if (!container || !totalEl) return;

    const items = Object.values(cart);
    if (!items.length) {
        container.innerHTML = '<p>Ваша корзина пуста.</p>';
        totalEl.textContent = '0 ₽';
        return;
    }

    container.innerHTML = '';
    items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <span>${item.name}</span>
            <span>${item.qty} шт × ${item.price} ₽</span>
        `;
        container.appendChild(row);
    });
    totalEl.textContent = getCartTotal(cart) + ' ₽';
}

function initAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-product');
            addToCart(id);
        });
    });

    const detailBtn = document.getElementById('add-to-cart-detail');
    if (detailBtn) {
        detailBtn.addEventListener('click', () => {
            const id = detailBtn.getAttribute('data-product');
            addToCart(id);
        });
    }
}

function initFeedbackForm() {
    const form = document.getElementById('feedback-form');
    const status = document.getElementById('form-status');
    if (!form || !status) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        status.textContent = 'Спасибо! Сообщение отправлено (учебная заглушка).';
    });
}

function initCheckoutForm() {
    const form = document.getElementById('checkout-form');
    const status = document.getElementById('checkout-status');
    if (!form || !status) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const cart = loadCart();
        if (!Object.keys(cart).length) {
            status.textContent = 'Корзина пуста. Добавьте товары перед оформлением.';
            return;
        }
        // В реальном проекте здесь был бы запрос на сервер.
        localStorage.removeItem('eco_cart');
        window.location.href = 'thankyou.html';
    });
}

function initCatalogFilters() {
    const grid = document.getElementById('product-grid');
    const filter = document.getElementById('category-filter');
    const search = document.getElementById('search-input');
    if (!grid || !filter || !search) return;

    function applyFilters() {
        const category = filter.value;
        const query = search.value.toLowerCase().trim();
        const cards = grid.querySelectorAll('.product-card');

        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const text = card.textContent.toLowerCase();
            const matchesCategory = category === 'all' || category === cardCategory;
            const matchesSearch = !query || text.includes(query);
            card.style.display = (matchesCategory && matchesSearch) ? '' : 'none';
        });
    }

    filter.addEventListener('change', applyFilters);
    search.addEventListener('input', applyFilters);
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initAddToCartButtons();
    renderCart();
    renderCheckoutSummary();
    initFeedbackForm();
    initCheckoutForm();
    initCatalogFilters();
});
