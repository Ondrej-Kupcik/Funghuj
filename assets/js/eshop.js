// === Globální proměnná pro produkty ===
let products = [];

// === Načti produkty z JSON při načtení stránky ===
window.addEventListener('DOMContentLoaded', () => {
  fetch('assets/data/products.json')
    .then(res => res.json())
    .then(data => {
      products = data;

      // Pokud je v URL produkt, zobraz ho
      const urlParams = new URLSearchParams(window.location.search);
      const produkt = urlParams.get('produkt');
      if (produkt) showProduct(produkt);
    });

  // Inicializace rozklikávacích kategorií
  const categoryHeaders = document.querySelectorAll('.category-block h3');
  categoryHeaders.forEach(header => {
    header.style.cursor = 'pointer';

    if (!header.textContent.trim().startsWith('+') && !header.textContent.trim().startsWith('–')) {
      header.textContent = `+ ${header.textContent.trim()}`;
    }

    const list = header.nextElementSibling;
    if (list && list.tagName.toLowerCase() === 'ul') {
      list.style.display = 'none';
    }
  });
});

// === Funkce: rozklikávání kategorií ===
function toggleCategory(header) {
  const list = header.nextElementSibling;
  const isOpen = list.style.display === 'block';

  list.style.display = isOpen ? 'none' : 'block';
  header.textContent = (isOpen ? '+ ' : '– ') + header.textContent.slice(2);
}

// === Funkce: zobrazení detailu produktu ===
function showProduct(id) {
  const detail = document.getElementById('product-detail');
  const product = products.find(p => p.id === id);
  if (!product) return;

  detail.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h2>${product.name}</h2>
    <p>
      ${product.description}<br><br>
      <strong>Balení:</strong> ${product.weight}<br>
      <strong>Cena za 1 balení:</strong> ${product.price} Kč
    </p>

    <div class="buy-block">
      <label for="${id}">Množství:</label>
      <select name="${id}" id="${id}">
        <option value="1">1 balení</option>
        <option value="2">2 balení</option>
        <option value="3">3 balení</option>
        <option value="4">4 balení</option>
      </select>
      <button onclick="addToCart('${product.name}', ${product.price}, '${id}')">Přidat do košíku</button>
    </div>
  `;
}

// === Přidání produktu do localStorage košíku ===
function addToCart(name, price, id) {
  const select = document.querySelector(`select[name="${id}"]`);
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
  alert(`Přidáno do košíku: ${qty}× ${name}`);
}
