// assets/js/order.js

// Helper: vykreslí celý náhled objednávky
function renderPreview() {
  const name     = document.querySelector('input[name="name"]').value.trim();
  const email    = document.querySelector('input[name="email"]').value.trim();
  const address  = document.querySelector('textarea[name="address"]').value.trim();
  const shipping = document.querySelector('input[name="shipping"]:checked');
  const payment  = document.querySelector('input[name="payment"]:checked');

  if (!shipping || !payment) {
    document.getElementById('order-preview').innerHTML = '';
    return;
  }

  const shippingFee   = parseInt(shipping.dataset.fee, 10) || 0;
  const paymentFee    = parseInt(payment.dataset.fee, 10)  || 0;
  const shippingText  = `${shipping.value} (+${shippingFee} Kč)`;
  const paymentText   = paymentFee
    ? `${payment.value} (+${paymentFee} Kč)`
    : `${payment.value} (zdarma)`;

  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  let subtotalAll = 0;
  const itemsHtml = Object.entries(cart).map(([prod, {qty,price}]) => {
    const sub = qty * price;
    subtotalAll += sub;
    return `<li>${qty}× ${prod} – ${sub} Kč</li>`;
  }).join('');

  const total = subtotalAll + shippingFee + paymentFee;

  document.getElementById('order-preview').innerHTML = `
    <h3>Vaše objednávka</h3>
    <p><strong>Jméno:</strong> ${name}</p>
    <p><strong>E-mail:</strong> ${email}</p>
    <p><strong>Adresa:</strong> ${address}</p>
    <p><strong>Doprava:</strong> ${shippingText}</p>
    <p><strong>Platba:</strong> ${paymentText}</p>
    <p><strong>Produkty:</strong></p>
    <ul>${itemsHtml}</ul>
    <p><strong>Celkem:</strong> ${total} Kč</p>
  `;
}

// Přepne viditelnost widgetu Packeta
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

// Otevře widget Packeta
function openPacketaWidget() {
  if (typeof Packeta.Widget === 'undefined') {
    return alert("Widget Zásilkovny se nepodařilo načíst. Zkuste obnovit stránku.");
  }
  Packeta.Widget.pick(
    '421c818cb0bf2d22',
    function (point) {
      const selectedText = `${point.name}, ${point.street}, ${point.city} (${point.zip})`;
      document.getElementById('packeta-selected').innerText = selectedText;
      document.getElementById('packeta-point-id').value = point.id;
      localStorage.setItem('packeta_point_id', point.id);
      localStorage.setItem('packeta_selected_text', selectedText);
      renderPreview();
    },
    {
      language: 'cs',
      country: 'cz'
    }
  );
}

window.addEventListener('DOMContentLoaded', () => {
  // 1) Přehled produktů
  const summary = document.getElementById('summary');
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  if (Object.keys(cart).length === 0) {
    summary.innerHTML = '<p>Košík je prázdný.</p>';
    document.getElementById('order-form').style.display = 'none';
  } else {
    let total = 0;
    const list = document.createElement('ul');
    for (const [name, item] of Object.entries(cart)) {
      const sub = item.qty * item.price;
      total += sub;
      const li = document.createElement('li');
      li.textContent = `${item.qty}× ${name} – ${sub} Kč`;
      list.appendChild(li);
    }
    const totalLine = document.createElement('p');
    totalLine.innerHTML = `<strong>Mezisoučet:</strong> ${total} Kč`;
    summary.appendChild(list);
    summary.appendChild(totalLine);
  }

  // 2) Packeta widget
  document.querySelectorAll('input[name="shipping"]').forEach(radio => {
    radio.addEventListener('change', () => {
      togglePacketaWidget();
      renderPreview();
      updateSubmitText();
    });
  });
  const packetaButton = document.getElementById('packeta-button');
  if (packetaButton) packetaButton.addEventListener('click', openPacketaWidget);

  // obnovit výdejní místo
  const storedId = localStorage.getItem('packeta_point_id');
  const storedTxt = localStorage.getItem('packeta_selected_text');
  if (storedId && storedTxt) {
    document.getElementById('packeta-point-id').value = storedId;
    document.getElementById('packeta-selected').innerText = storedTxt;
    document.getElementById('packeta-widget-container').style.display = 'block';
  }

  // 3) Dynamická změna textu tlačítka
  const submitBtn = document.querySelector('#order-form button[type="submit"]');
  function updateSubmitText() {
    const pay = document.querySelector('input[name="payment"]:checked')?.value;
    submitBtn.textContent =
      (pay === 'kartou' || pay === 'prevodem')
        ? 'Odeslat a zaplatit'
        : 'Odeslat objednávku';
  }
  document.querySelectorAll('input[name="payment"]').forEach(r => {
    r.addEventListener('change', () => {
      renderPreview();
      updateSubmitText();
    });
  });
  updateSubmitText();

  // 4) Vázání renderPreview na změny vstupů
  document.querySelectorAll(
    'input[name="name"], input[name="email"], textarea[name="address"]'
  ).forEach(el => {
    el.addEventListener('input', renderPreview);
  });
  renderPreview();

  // 5) Reload na back/forward
  if (performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
    location.reload();
  }
});

// 📤 Odeslání formuláře
document.getElementById('order-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form     = e.target;
  const name     = form.name.value.trim();
  const email    = form.email.value.trim();
  const address  = form.address.value.trim();
  const shipping = document.querySelector('input[name="shipping"]:checked');
  const payment  = document.querySelector('input[name="payment"]:checked');

  if (!name || !email || !address || !shipping || !payment) {
    alert('Vyplňte všechna pole.');
    return;
  }

  const shippingMethod = shipping.value;
  const shippingFee    = parseInt(shipping.dataset.fee, 10) || 0;
  const paymentMethod  = payment.value;
  const paymentFee     = parseInt(payment.dataset.fee, 10) || 0;

  // pokud Packeta a není id
  const packetaPoint = document.getElementById('packeta-point-id').value;
  if (shippingMethod === 'packeta' && !packetaPoint) {
    alert('Vyberte výdejní místo Zásilkovny.');
    return;
  }

  // chování podle platby
  if (paymentMethod === 'dobirka') {
    localStorage.clear();
    return window.location.href = '/thank-you.html';
  }
  if (paymentMethod === 'prevodem') {
    localStorage.clear();
    return window.location.href = '/thank-you.html';
  }
  if (paymentMethod === 'kartou') {
    const resp = await fetch('/create-payment-session.php', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        total: shippingFee + paymentFee +
          Object.values(JSON.parse(localStorage.getItem('cart')||'{}'))
                .reduce((s,i)=>s+i.qty*i.price,0)
      })
    });
    const { paymentUrl } = await resp.json();
    return window.location = paymentUrl;
  }
});
