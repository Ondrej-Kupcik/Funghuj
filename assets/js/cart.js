function addToCart(name, price) {
  const productId = name.toLowerCase().replace(/[^a-z0-9]/gi, '-');
  const select = document.querySelector(`select[name="${productId}-qty"]`);

  if (!select) {
    alert('Výběr množství nebyl nalezen.');
    return;
  }

  const qty = parseInt(select.value);

  if (isNaN(qty) || qty < 1) {
    alert('Vyber počet balení.');
    return;
  }

  const cart = JSON.parse(localStorage.getItem('cart') || '{}');

  if (cart[name]) {
    cart[name].qty += qty;
  } else {
    cart[name] = { qty, price };
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`Přidáno do objednávky: ${qty}× ${name}`);
}

function loadCart() {
  const container = document.getElementById('cart-container');
  const totalDisplay = document.getElementById('cart-total');
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  container.innerHTML = '';
  let total = 0;

  if (Object.keys(cart).length === 0) {
    container.innerHTML = '<p>Váš košík je prázdný.</p>';
    totalDisplay.textContent = '0 Kč';
    return;
  }

  for (const [name, item] of Object.entries(cart)) {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-name">${name}</div>
      <div class="cart-item-controls">
        <button onclick="updateQty('${name}', -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="updateQty('${name}', 1)">+</button>
        <span>${item.price * item.qty} Kč</span>
        <button onclick="removeItem('${name}')" title="Odebrat">
  <i class="fas fa-trash"></i>
</button>
      </div>
    `;
    container.appendChild(row);
    total += item.price * item.qty;
  }

  totalDisplay.textContent = `${total} Kč`;
}

function updateQty(name, change) {
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  if (!cart[name]) return;

  cart[name].qty += change;
  if (cart[name].qty < 1) {
    delete cart[name];
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
}

function removeItem(name) {
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  delete cart[name];
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
}

window.addEventListener('DOMContentLoaded', loadCart);
