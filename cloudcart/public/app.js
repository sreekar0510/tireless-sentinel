const params = new URLSearchParams(window.location.search);

const scenario = params.get("scenario") || "baseline";

let cartItems = 0;

const shopSection =
  document.getElementById("shop-section");

const cartSection =
  document.getElementById("cart-section");

const checkoutSection =
  document.getElementById("checkout-section");

const confirmationSection =
  document.getElementById("confirmation-section");

const cartCount =
  document.getElementById("cart-count");

const addToCartButton =
  document.getElementById("add-to-cart");

const cartButton =
  document.getElementById("cart-button");

const checkoutButton =
  document.getElementById("checkout-button");


// --------------------------------------------------
// SCENARIO CONFIGURATION
// --------------------------------------------------

if (scenario === "ui-change") {

  const placeOrderButton =
    document.getElementById("place-order");

  placeOrderButton.id =
    "complete-purchase";

  placeOrderButton.textContent =
    "Complete Purchase";
}


// --------------------------------------------------
// BUSINESS BUG SIMULATION
// --------------------------------------------------

if (scenario === "bug") {

  const cartTotal =
    document.getElementById("cart-total");

  cartTotal.textContent =
    "₹2,99,990";
}


// --------------------------------------------------
// CART
// --------------------------------------------------

addToCartButton.addEventListener("click", () => {

  cartItems = 1;

  cartCount.textContent = cartItems;

  alert("Product added to cart");
});


// --------------------------------------------------
// OPEN CART
// --------------------------------------------------

cartButton.addEventListener("click", () => {

  shopSection.classList.add("hidden");

  cartSection.classList.remove("hidden");
});


// --------------------------------------------------
// CHECKOUT
// --------------------------------------------------

checkoutButton.addEventListener("click", () => {

  cartSection.classList.add("hidden");

  checkoutSection.classList.remove("hidden");
});


// --------------------------------------------------
// PLACE ORDER
// --------------------------------------------------

const placeOrderButton =
  document.querySelector(
    "#place-order, #complete-purchase"
  );

placeOrderButton.addEventListener("click", () => {

  checkoutSection.classList.add("hidden");

  confirmationSection.classList.remove("hidden");
});