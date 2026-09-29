const products = [
  { id: 1, name: "Body Perla", size: "S", price: 649, image: "src/img/Talla Chica✨/polish_save(30).jpg", badge: "Favorito" },
  { id: 2, name: "Body Azul Medianoche", size: "M", price: 729, image: "src/img/Talla Mediana🍒/polish_save(24).jpg", badge: "Nuevo" },
  { id: 3, name: "Set Rubí", size: "L", price: 799, image: "src/img/Talla Grande🎀/polish_save(3).jpg", badge: "Edición especial" },
  { id: 4, name: "Body Carmesí", size: "XL", price: 749, image: "src/img/Talla XL 🍑/polish_save.jpg", badge: "Curvy" },
  { id: 5, name: "Body Magnolia", size: "S", price: 679, image: "src/img/Talla Chica✨/polish_save(37).jpg", badge: "Nuevo" },
  { id: 6, name: "Encaje Cereza", size: "M", price: 699, image: "src/img/Talla Mediana🍒/polish_save(35).jpg", badge: "Exclusivo" },
  { id: 7, name: "Body Noir", size: "L", price: 759, image: "src/img/Talla Grande🎀/polish_save(1).jpg", badge: "Esencial" },
  { id: 8, name: "Set Coral", size: "S", price: 629, image: "src/img/Talla Chica✨/polish_save(48).jpg", badge: "Últimas piezas" }
];

const STORAGE_KEY = "luna-intimates-cart";
let cart = loadCart();
let activeFilter = "Todos";
const grid = document.querySelector("#product-grid");
const cartDrawer = document.querySelector("#cart-drawer");
const overlay = document.querySelector("#overlay");
const cartItems = document.querySelector("#cart-items");
const modal = document.querySelector("#checkout-modal");
let toastTimer;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved.filter(item => products.some(product => product.id === item.id) && item.quantity > 0) : [];
  } catch { return []; }
}

function money(value) { return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value); }
function saveCart() { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }

function renderProducts() {
  const visible = activeFilter === "Todos" ? products : products.filter(product => product.size === activeFilter);
  grid.innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-image"><img src="${product.image}" alt="${product.name}, talla ${product.size}" loading="lazy"><span class="product-badge">${product.badge}</span><button class="quick-add" data-add="${product.id}" aria-label="Añadir ${product.name} al carrito">+</button></div>
      <div class="product-info"><h3>${product.name}</h3><div class="product-meta"><span>Talla ${product.size} · Encaje suave</span><strong class="product-price">${money(product.price)}</strong></div></div>
    </article>`).join("");
}

function addToCart(id) {
  const item = cart.find(entry => entry.id === id);
  if (item) item.quantity += 1; else cart.push({ id, quantity: 1 });
  updateCart();
  showToast();
}

function changeQuantity(id, change) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== id);
  updateCart();
}

function removeItem(id) { cart = cart.filter(entry => entry.id !== id); updateCart(); }

function updateCart() {
  saveCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(product => product.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  document.querySelectorAll(".cart-count").forEach(badge => badge.textContent = count);
  document.querySelector("#cart-label").textContent = `(${count})`;
  document.querySelector("#subtotal").textContent = money(subtotal);
  document.querySelector("#total").textContent = `${money(subtotal)} MXN`;
  document.querySelector("#checkout-button").disabled = cart.length === 0;
  if (!cart.length) {
    cartItems.innerHTML = `<div class="empty-cart"><span>♡</span><h3>Tu bolsa está esperando</h3><p>Descubre esa pieza que se sentirá hecha para ti.</p><button class="button button-primary" data-close-cart>Ver colección</button></div>`;
    return;
  }
  cartItems.innerHTML = cart.map(item => {
    const product = products.find(product => product.id === item.id);
    return `<article class="cart-item"><img src="${product.image}" alt="${product.name}"><div><h3>${product.name}</h3><small>Talla ${product.size}</small><div class="quantity"><button data-change="-1" data-id="${item.id}" aria-label="Restar uno">−</button><span>${item.quantity}</span><button data-change="1" data-id="${item.id}" aria-label="Sumar uno">+</button></div></div><div class="item-side"><strong>${money(product.price * item.quantity)}</strong><button class="remove-item" data-remove="${item.id}" aria-label="Eliminar ${product.name}">×</button></div></article>`;
  }).join("");
}

function openCart() { cartDrawer.classList.add("open"); overlay.classList.add("open"); cartDrawer.setAttribute("aria-hidden", "false"); document.body.classList.add("no-scroll"); cartDrawer.querySelector("[data-close-cart]")?.focus(); }
function closeCart() { cartDrawer.classList.remove("open"); overlay.classList.remove("open"); cartDrawer.setAttribute("aria-hidden", "true"); document.body.classList.remove("no-scroll"); }
function showToast() { const toast = document.querySelector("#toast"); toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 1800); }

document.addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  const change = event.target.closest("[data-change]");
  const remove = event.target.closest("[data-remove]");
  const filter = event.target.closest("[data-filter]");
  if (add) addToCart(Number(add.dataset.add));
  if (change) changeQuantity(Number(change.dataset.id), Number(change.dataset.change));
  if (remove) removeItem(Number(remove.dataset.remove));
  if (event.target.closest("[data-open-cart]")) openCart();
  if (event.target.closest("[data-close-cart]") || event.target === overlay) closeCart();
  if (event.target.closest("[data-close-modal]")) modal.close();
  if (filter) { activeFilter = filter.dataset.filter; document.querySelectorAll(".filter").forEach(button => button.classList.toggle("active", button === filter)); renderProducts(); }
});

document.querySelector("#checkout-button").addEventListener("click", () => { closeCart(); modal.showModal(); });
document.querySelector("#checkout-form").addEventListener("submit", event => {
  event.preventDefault();
  document.querySelector("#checkout-form-view").hidden = true;
  document.querySelector("#success-view").hidden = false;
  cart = [];
  updateCart();
});
modal.addEventListener("click", event => { if (event.target === modal) modal.close(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });
document.querySelector(".menu-toggle").addEventListener("click", event => { const nav = document.querySelector(".main-nav"); nav.classList.toggle("open"); event.currentTarget.setAttribute("aria-expanded", nav.classList.contains("open")); });
document.querySelectorAll(".main-nav a").forEach(link => link.addEventListener("click", () => document.querySelector(".main-nav").classList.remove("open")));
document.querySelector("#year").textContent = new Date().getFullYear();
renderProducts();
updateCart();
