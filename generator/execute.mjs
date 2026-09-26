import "dotenv/config";
import { chromium } from "playwright";

import {
  recoverElement,
} from "../healing/recover.mjs";

import {
  getRememberedSelector,
  rememberSelector,
  markVerified,
} from "../memory/store.mjs";

import {
  validateCart,
} from "../oracle/business.mjs";

import {
  saveReport,
} from "../reports/store.mjs";

import fs from "fs/promises";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const generatedTestPath =
  "./generator/generated-test.json";

const scenario =
  process.argv[2] || "baseline";

const memoryKey =
  "checkout.place_order";

// --------------------------------------------------
// LOAD GENERATED TEST
// --------------------------------------------------

const testPlan = JSON.parse(
  await fs.readFile(
    generatedTestPath,
    "utf8"
  )
);

console.log("\n🤖 TIRELESS SENTINEL TEST EXECUTOR");
console.log("------------------------------------");

console.log(
  `Test: ${testPlan.name}`
);

console.log(
  `Request: ${testPlan.description}`
);

console.log(
  `Scenario: ${scenario}`
);

console.log(
  `Steps: ${testPlan.steps.length}`
);

// --------------------------------------------------
// START BROWSER
// --------------------------------------------------

const browser =
  await chromium.launch({
    headless: false,
  });

const page =
  await browser.newPage();

page.on(
  "dialog",
  async (dialog) => {
    await dialog.accept();
  }
);

// --------------------------------------------------
// TRACKING
// --------------------------------------------------

const startedAt =
  Date.now();

let finalStatus =
  "UNKNOWN";

let recoverySource =
  "none";

let recoveredSelector =
  null;

let modelCalls =
  0;

// --------------------------------------------------
// EXECUTE STEPS
// --------------------------------------------------

try {

  for (const step of testPlan.steps) {

    console.log(
      `\n▶ Step ${step.id}: ${step.action}`
    );

    // ----------------------------------------------
    // NAVIGATE
    // ----------------------------------------------

    if (step.action === "navigate") {

      let url =
        step.value;

      // Add our scenario to the application URL.
      const separator =
        url.includes("?")
          ? "&"
          : "?";

      url =
        `${url}${separator}scenario=${scenario}`;

      console.log(
        `🌐 Opening ${url}`
      );

      await page.goto(url);

      console.log(
        "✅ Page opened"
      );

      continue;
    }

    // ----------------------------------------------
    // FILL
    // ----------------------------------------------

    if (step.action === "fill") {

      console.log(
        `✍️ Filling: ${step.targetIntent}`
      );

      await page.locator(
        step.selector
      ).fill(step.value);

      console.log(
        "✅ Input filled"
      );

      continue;
    }

    // ----------------------------------------------
    // BUSINESS ASSERTION
    // ----------------------------------------------

    if (step.action === "assertBusiness") {

      console.log(
        "🧮 Running Business Oracle..."
      );

      const result =
        await validateCart(page);

      console.log(
        `Expected: ₹${result.expected}`
      );

      console.log(
        `Actual: ₹${result.actual}`
      );

      if (
        result.status === "BUG"
      ) {

        console.log(
          "\n🐛 FUNCTIONAL REGRESSION DETECTED"
        );

        console.log(
          `Reason: ${result.reason}`
        );

        await page.screenshot({
          path: "generated-test-bug.png",
          fullPage: true,
        });

        await saveReport({
          scenario,
          status: "BUG",
          businessValidation: "FAIL",
          expectedTotal: result.expected,
          actualTotal: result.actual,
          healing: "REJECTED",
          recoverySource: "none",
          modelCalls: 0,
          durationMs:
            Date.now() - startedAt,
        });

        finalStatus =
          "BUG";
      }

      console.log(
        "✅ Business validation passed"
      );

      continue;
    }

    // ----------------------------------------------
    // NORMAL ASSERTION
    // ----------------------------------------------

    if (step.action === "assert") {

      const element =
        page.locator(
          step.selector
        );

      await element.waitFor({
        state: "visible",
      });

      if (step.expectedText) {

        const text =
          await element.textContent();

        if (
          !text?.includes(
            step.expectedText
          )
        ) {

          throw new Error(
            `Expected text "${step.expectedText}" was not found.`
          );
        }
      }

      console.log(
        "✅ Assertion passed"
      );

      continue;
    }

    // ----------------------------------------------
    // CLICK
    // ----------------------------------------------

    if (step.action === "click") {

      try {

        console.log(
          `🖱️ Clicking: ${step.targetIntent}`
        );

        await page.locator(
          step.selector
        ).click({
          timeout: 3000,
        });

        console.log(
          "✅ Click successful"
        );

      } catch {

        console.log(
          `⚠️ Selector failed: ${step.selector}`
        );

        console.log(
          "🔧 Starting self-healing..."
        );

        // ------------------------------------------
        // CHECK MEMORY FIRST
        // ------------------------------------------

        let remembered =
          await getRememberedSelector(
            memoryKey
          );

        let selectedSelector =
          null;

        if (
          remembered?.currentSelector
        ) {

          const rememberedElement =
            page.locator(
              remembered.currentSelector
            );

          const count =
            await rememberedElement.count();

          if (count === 1) {

            selectedSelector =
              remembered.currentSelector;

            recoverySource =
              "memory";

            console.log(
              `🧠 Memory hit: ${selectedSelector}`
            );
          }
        }

        // ------------------------------------------
        // ASK EXISTING AI RECOVERY ENGINE
        // ------------------------------------------

        if (!selectedSelector) {

          const recovery =
            await recoverElement(
              page,
              step.targetIntent,
              step.selector,
              memoryKey
            );

          selectedSelector =
            recovery.selector;

          recoverySource =
            recovery.source;

          recoveredSelector =
            recovery.selector;

          modelCalls +=
            recovery.modelCalls || 0;

          // ----------------------------------------
          // SAVE AI DISCOVERY
          // ----------------------------------------

          if (
            recovery.source === "ai"
          ) {

            await rememberSelector(
              memoryKey,
              {
                intent:
                  step.targetIntent,

                originalSelector:
                  step.selector,

                currentSelector:
                  recovery.selector,

                confidence:
                  recovery.confidence,

                reason:
                  recovery.reason,

                verifiedRuns:
                  1,
              }
            );

            console.log(
              "🧠 New recovery saved to memory."
            );
          }
        }

        // ------------------------------------------
        // VERIFY RECOVERED ELEMENT
        // ------------------------------------------

        const healedElement =
          page.locator(
            selectedSelector
          );

        const count =
          await healedElement.count();

        if (count !== 1) {

          throw new Error(
            `Recovery selector "${selectedSelector}" matched ${count} elements.`
          );
        }

        await healedElement.click();

        recoveredSelector =
          selectedSelector;

        console.log(
          `🔧 Recovered with ${recoverySource}: ${selectedSelector}`
        );
      }

      continue;
    }

    // ----------------------------------------------
    // UNKNOWN ACTION
    // ----------------------------------------------

    throw new Error(
      `Unknown action: ${step.action}`
    );
  }

  // ------------------------------------------------
  // SUCCESS
  // ------------------------------------------------

  if (
    recoverySource === "memory" ||
    recoverySource === "ai"
  ) {

    finalStatus =
      "HEALED";

  } else {

    finalStatus =
      "PASS";
  }

  console.log(
    "\n🎉 GENERATED TEST PASSED"
  );

  console.log(
    `Final status: ${finalStatus}`
  );

  // ------------------------------------------------
  // UPDATE MEMORY VERIFICATION COUNT
  // ------------------------------------------------

  if (
    recoverySource === "memory"
  ) {

    await markVerified(
      memoryKey
    );

    console.log(
      "🧠 Memory entry verified again."
    );
  }

  // ------------------------------------------------
  // SAVE REPORT
  // ------------------------------------------------

  await saveReport({
    scenario,
    status: finalStatus,
    businessValidation: "PASS",
    originalSelector:
      "#place-order",
    recoveredSelector,
    recoverySource,
    modelCalls,
    durationMs:
      Date.now() - startedAt,
  });

  await page.screenshot({
    path:
      `generated-test-${scenario}.png`,
    fullPage: true,
  });

  console.log(
    `📸 Screenshot saved as generated-test-${scenario}.png`
  );

} catch (error) {

  finalStatus =
    "FAIL";

  console.log(
    "\n❌ GENERATED TEST FAILED"
  );

  console.error(
    error.message
  );

  await saveReport({
    scenario,
    status: "FAIL",
    businessValidation: "UNKNOWN",
    recoveredSelector,
    recoverySource,
    modelCalls,
    durationMs:
      Date.now() - startedAt,
  });

} finally {

  await page.waitForTimeout(
    1000
  );

  await browser.close();

  console.log(
    "🏁 Generated test execution finished."
  );
}