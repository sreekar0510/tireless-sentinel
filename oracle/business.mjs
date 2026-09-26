function parseCurrency(value) {
  if (!value) {
    return 0;
  }

  return Number(
    value
      .replace(/[₹,\s]/g, "")
      .trim()
  );
}

export async function validateCart(page) {
  console.log("\n🧮 BUSINESS ORACLE");

  // Authoritative product price
  const productCard = page.locator("#product-card");

  const unitPrice = Number(
    await productCard.getAttribute("data-price")
  );

  if (!Number.isFinite(unitPrice)) {
    throw new Error(
      "Business Oracle could not determine product price."
    );
  }

  // Our demo cart always contains exactly one item.
  const quantity = 1;

  const expectedTotal = unitPrice * quantity;

  // Read the actual total shown by the application.
  const displayedTotalText =
    await page.locator("#cart-total").textContent();

  const actualTotal =
    parseCurrency(displayedTotalText);

  console.log(`Unit price: ₹${unitPrice}`);
  console.log(`Quantity: ${quantity}`);
  console.log(`Expected total: ₹${expectedTotal}`);
  console.log(`Actual total: ₹${actualTotal}`);

  if (actualTotal !== expectedTotal) {
    return {
      status: "BUG",
      reason: "Cart total violates the checkout pricing invariant.",
      expected: expectedTotal,
      actual: actualTotal,
    };
  }

  return {
    status: "PASS",
    reason: "Cart total matches product price × quantity.",
    expected: expectedTotal,
    actual: actualTotal,
  };
}