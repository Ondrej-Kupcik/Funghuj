window.addEventListener('DOMContentLoaded', () => {
  const summary = document.getElementById('summary');
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');

  if (Object.keys(cart).length === 0) {
    summary.innerHTML = '<p>Košík je prázdný.</p>';
    document.getElementById('order-form').style.display = 'none';
    return;
  }

  // 🛒 Přehled produktů
  let total = 0;
  const list = document.createElement('ul');
  for (const [name, item] of Object.entries(cart)) {
    const line = document.createElement('li');
    const subtotal = item.qty * item.price;
    total += subtotal;
    line.textContent = `${item.qty}× ${name} – ${subtotal} Kč`;
    list.appendChild(line);
  }
  const totalLine = document.createElement('p');
  totalLine.innerHTML = `<strong>Mezisoučet:</strong> ${total} Kč`;
  summary.appendChild(list);
  summary.appendChild(totalLine);

  // 🎯 Znovuobnovení událostí na přepínače dopravy
  document.querySelectorAll('input[name="shipping"]').forEach(radio => {
    radio.addEventListener('change', togglePacketaWidget);
  });

  // 🧠 Obnovení výdejního místa z localStorage (do DOMu i formuláře)
  const storedPointId = localStorage.getItem('packeta_point_id');
  const storedPointText = localStorage.getItem('packeta_selected_text');
  const packetaContainer = document.getElementById('packeta-widget-container');

  if (storedPointId && storedPointText) {
    document.getElementById('packeta-point-id').value = storedPointId;
    document.getElementById('packeta-selected').innerText = storedPointText;
    packetaContainer.style.display = 'block';
  }

  // ✅ Tlačítko na otevření widgetu
  const packetaButton = document.getElementById('packeta-button');
  if (packetaButton) {
    packetaButton.addEventListener('click', openPacketaWidget);
  }

  // 🔁 Reload stránky při návratu zpět z widgetu (back-forward navigation)
  if (performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
    console.log("Back navigation detected, reloading...");
    location.reload();
  }
});

// 🎯 Přepnutí viditelnosti výběru Zásilkovny
function togglePacketaWidget() {
  const selected = document.querySelector('input[name="shipping"]:checked')?.value;
  const container = document.getElementById('packeta-widget-container');
  if (selected === 'packeta') {
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
    document.getElementById('packeta-point-id').value = '';
    document.getElementById('packeta-selected').textContent = '';
    localStorage.removeItem('packeta_point_id');
    localStorage.removeItem('packeta_selected_text');
  }
}

// 📦 Otevře widget Zásilkovny
function openPacketaWidget() {
  if (typeof Packeta.Widget !== 'undefined') {
    Packeta.Widget.pick({
      appIdentity: '421c818cb0bf2d22', // 🔑 Vlož svůj klíč
      language: 'cs',
      country: 'cz',
      callback: function (point) {
        const selectedText = `${point.name}, ${point.street}, ${point.city} (${point.zip})`;
        document.getElementById('packeta-selected').innerText = selectedText;
        document.getElementById('packeta-point-id').value = point.id;
        localStorage.setItem('packeta_point_id', point.id);
        localStorage.setItem('packeta_selected_text', selectedText);
        console.log("Zásilkovna vybrána:", selectedText);
      }
    });
  } else {
    alert("Widget Zásilkovny se nepodařilo načíst. Zkuste znovu načíst stránku.");
  }
}

// 📤 Odeslání formuláře
document.getElementById('order-form').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const address = form.address.value.trim();
  const shipping = document.querySelector('input[name="shipping"]:checked');

  if (!name || !email || !address || !shipping) {
    alert('Vyplňte všechna pole.');
    return;
  }

  const shippingMethod = shipping.value;
  const shippingPrice = parseInt(shipping.dataset.price, 10);
  const packetaPoint = document.getElementById('packeta-point-id').value;
  const packetaText = document.getElementById('packeta-selected').textContent;

  if (shippingMethod === 'packeta' && !packetaPoint) {
    alert('Vyberte výdejní místo Zásilkovny.');
    return;
  }

  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  let orderBody = `Objednávka od: ${name}\nEmail: ${email}\nAdresa: ${address}\n\nProdukty:\n`;
  let total = 0;
  for (const [product, { qty, price }] of Object.entries(cart)) {
    const subtotal = qty * price;
    total += subtotal;
    orderBody += `• ${qty}× ${product} – ${subtotal} Kč\n`;
  }
  total += shippingPrice;
  orderBody += `\nZpůsob dopravy: ${shippingMethod} (${shippingPrice} Kč)\n`;
  if (shippingMethod === 'packeta') {
    orderBody += `Výdejní místo: ${packetaText} (ID: ${packetaPoint})\n`;
  }
  orderBody += `Celková cena: ${total} Kč`;

  alert('Děkujeme za objednávku! Tady je její přehled:\n\n' + orderBody);
  localStorage.clear(); // smaže i výběr z packety i košík
  window.location.href = '/index.html';
});
