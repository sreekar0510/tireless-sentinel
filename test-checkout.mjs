import "dotenv/config";
import { chromium } from "playwright";

import { recoverElement } from "./healing/recover.mjs";

import {
  rememberSelector,
  markVerified,
} from "./memory/store.mjs";

import { validateCart } from "./oracle/business.mjs";

import { saveReport } from "./reports/store.mjs";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const scenario = process.argv[2] || "baseline";
const startedAt = Date.now();

const memoryKey = "checkout.place_order";

const businessIntent =
  "Place the customer's order and complete checkout";

// --------------------------------------------------
// RUN STATE
// --------------------------------------------------

let finalStatus = "UNKNOWN";
let recoverySource = "none";
let recoveredSelector = null;
let modelCalls = 0;
let recoveryInfo = null;

// --------------------------------------------------
// START BROWSER
// --------------------------------------------------

const browser = await chromium.launch({
  headless: false,
});

const page = await browser.newPage();

// Automatically accept the "Product added to cart" alert.
page.on("dialog", async (dialog) => {
  await dialog.accept();
});

console.log("🚀 Starting CloudCart checkout test...");
console.log(`🧪 Scenario: ${scenario}`);

// --------------------------------------------------
// 1. OPEN APPLICATION
// --------------------------------------------------

await page.goto(
  `http://localhost:3000/?scenario=${scenario}`
);

console.log("✅ CloudCart opened");

// --------------------------------------------------
// 2. SEARCH PRODUCT
// --------------------------------------------------

await page.locator("#search-input").fill("Sony");
await page.locator("#search-button").click();

console.log("✅ Product search completed");

// --------------------------------------------------
// 3. ADD TO CART
// --------------------------------------------------

await page.locator("#add-to-cart").click();

console.log("✅ Product added to cart");

// --------------------------------------------------
// 4. OPEN CART
// --------------------------------------------------

await page.locator("#cart-button").click();

console.log("✅ Cart opened");

// --------------------------------------------------
// 5. BUSINESS VALIDATION
// --------------------------------------------------

const businessResult = await validateCart(page);

if (businessResult.status === "BUG") {
  console.log("\n🐛 FUNCTIONAL REGRESSION DETECTED");
  console.log(`Reason: ${businessResult.reason}`);
  console.log(`Expected: ₹${businessResult.expected}`);
  console.log(`Actual: ₹${businessResult.actual}`);

  await page.screenshot({
    path: "business-bug.png",
    fullPage: true,
  });

console.log(
  "📸 Bug screenshot saved as business-bug.png"
);

console.log(
  "✅ TEST COMPLETED — BUSINESS BUG DETECTED"
);

  await saveReport({
    scenario,
    status: "BUG",
    businessValidation: "FAIL",
    expectedTotal: businessResult.expected,
    actualTotal: businessResult.actual,
    healing: "REJECTED",
    recoverySource: "none",
    modelCalls: 0,
    durationMs: Date.now() - startedAt,
  });

  await browser.close();

  process.exit(1);
}

console.log("✅ Business validation passed");

// --------------------------------------------------
// 6. OPEN CHECKOUT
// --------------------------------------------------

await page.locator("#checkout-button").click();

console.log("✅ Checkout opened");

// --------------------------------------------------
// 7. PLACE ORDER + SELF HEALING
// --------------------------------------------------

try {
  await page.locator("#place-order").click({
    timeout: 3000,
  });

  console.log(
    "✅ Order placed using original selector"
  );

  finalStatus = "PASS";

} catch {
  console.log(
    "⚠️ Original selector failed. Starting recovery..."
  );

recoveryInfo = await recoverElement(
  page,
  businessIntent,
  "#place-order",
  memoryKey
);

  recoverySource = recoveryInfo.source;
  recoveredSelector = recoveryInfo.selector;
  modelCalls = recoveryInfo.modelCalls || 0;

await page.locator(
  recoveryInfo.selector
).click();

console.log(
  "✅ Recovered selector clicked successfully."
);

  console.log(
    `🔧 Order placed using ${recoveryInfo.source} recovery`
  );

  finalStatus = "HEALED";
}

// --------------------------------------------------
// 8. VERIFY ORDER CONFIRMATION
// --------------------------------------------------

const confirmation =
  page.locator("#confirmation-section");

await confirmation.waitFor({
  state: "visible",
});

const confirmationText =
  await confirmation.textContent();

if (!confirmationText?.includes("Order confirmed")) {
  console.log(
    "❌ TEST FAILED — Confirmation not found"
  );

  await saveReport({
    scenario,
    status: "FAIL",
    businessValidation: "PASS",
    originalSelector: "#place-order",
    recoveredSelector,
    recoverySource,
    modelCalls,
    healing: "FAILED",
    durationMs: Date.now() - startedAt,
  });

await browser.close();

process.exit(0);
}

console.log(
  "🎉 TEST PASSED — Order confirmed successfully!"
);

// --------------------------------------------------
// 9. UPDATE MEMORY
// --------------------------------------------------

if (recoverySource === "ai") {
  await rememberSelector(memoryKey, {
    intent: businessIntent,
    originalSelector: "#place-order",
    currentSelector: recoveredSelector,
    confidence: recoveryInfo.confidence,
    reason: "Recovered by AI and verified by successful checkout.",
    verifiedRuns: 1,
  });

  console.log(
    "🧠 Memory updated with verified recovery."
  );

} else if (recoverySource === "memory") {
  await markVerified(memoryKey);

  console.log(
    "🧠 Memory entry verified again."
  );
}

// --------------------------------------------------
// 10. SCREENSHOT
// --------------------------------------------------

await page.screenshot({
  path: `checkout-${scenario}.png`,
  fullPage: true,
});

console.log(
  `📸 Screenshot saved as checkout-${scenario}.png`
);

// --------------------------------------------------
// 11. SAVE REPORT
// --------------------------------------------------

await saveReport({
  scenario,
  status: finalStatus,
  businessValidation: "PASS",
  originalSelector: "#place-order",
  recoveredSelector,
  recoverySource,
  modelCalls,
  durationMs: Date.now() - startedAt,
});

// --------------------------------------------------
// 12. CLOSE
// --------------------------------------------------

await page.waitForTimeout(1000);

await browser.close();

console.log("🏁 Test finished");