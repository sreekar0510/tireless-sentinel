import "dotenv/config";
import fs from "fs/promises";
import OpenAI from "openai";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const userRequest =
  process.argv.slice(2).join(" ").trim() ||
  "Test whether a customer can purchase Sony headphones";

const outputPath =
  "generator/generated-test.json";

const useAI =
  process.env.USE_LLM === "true" &&
  Boolean(process.env.OPENAI_API_KEY);

// --------------------------------------------------
// OFFLINE FALLBACK GENERATOR
// --------------------------------------------------

function generateOfflinePlan(request) {
  const product =
    request.toLowerCase().includes("sony")
      ? "Sony"
      : "product";

  return {
    name: "CloudCart Checkout",
    description: request,

    application: {
      name: "CloudCart",
      url: "http://localhost:3000",
    },

    steps: [
      {
        id: 1,
        action: "navigate",
        target: "CloudCart",
        value: "http://localhost:3000",
      },

      {
        id: 2,
        action: "fill",
        targetIntent: "Search for a product",
        selector: "#search-input",
        value: product,
      },

      {
        id: 3,
        action: "click",
        targetIntent: "Search for the product",
        selector: "#search-button",
      },

      {
        id: 4,
        action: "click",
        targetIntent: "Add the product to the cart",
        selector: "#add-to-cart",
      },

      {
        id: 5,
        action: "click",
        targetIntent: "Open the shopping cart",
        selector: "#cart-button",
      },

      {
        id: 6,
        action: "assertBusiness",
        targetIntent:
          "Verify that the cart total equals product price multiplied by quantity",
      },

      {
        id: 7,
        action: "click",
        targetIntent: "Proceed to checkout",
        selector: "#checkout-button",
      },

      {
        id: 8,
        action: "click",
        targetIntent:
          "Place the customer's order and complete checkout",
        selector: "#place-order",
      },

      {
        id: 9,
        action: "assert",
        targetIntent:
          "Verify that the order confirmation is displayed",
        selector: "#confirmation-section",
        expectedText: "Order confirmed",
      },
    ],

    successCriteria: [
      "Product can be searched",
      "Product can be added to cart",
      "Cart total is mathematically correct",
      "Checkout can be opened",
      "Order can be completed",
      "Order confirmation is displayed",
    ],

    generatedBy: "offline-fallback",
    generatedAt: new Date().toISOString(),
  };
}

// --------------------------------------------------
// AI GENERATOR
// --------------------------------------------------

async function generateAIPlan(request) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
You are an autonomous UI test planner.

Create a structured end-to-end browser test for this request:

"${request}"

Target application:
CloudCart at http://localhost:3000

The plan must test a real user workflow.

Return ONLY valid JSON in this structure:

{
  "name": "test name",
  "description": "what the test validates",
  "application": {
    "name": "CloudCart",
    "url": "http://localhost:3000"
  },
  "steps": [
    {
      "id": 1,
      "action": "navigate|fill|click|assert|assertBusiness",
      "targetIntent": "business meaning of this step",
      "selector": "CSS selector when applicable",
      "value": "value when applicable",
      "expectedText": "expected text when applicable"
    }
  ],
  "successCriteria": [
    "criterion 1",
    "criterion 2"
  ],
  "generatedBy": "gpt-5-nano"
}

Important:
- Use business meaning in targetIntent.
- Prefer stable selectors when known.
- Use assertBusiness for business rules such as totals.
- Do not invent unnecessary steps.
- Return JSON only.
`;

  const response =
    await client.responses.create({
      model: "gpt-5-nano",
      input: prompt,
    });

  const text =
    response.output_text.trim();

  return JSON.parse(text);
}

// --------------------------------------------------
// MAIN
// --------------------------------------------------

async function main() {
  console.log("\n🤖 TIRELESS SENTINEL TEST GENERATOR");
  console.log("------------------------------------");

  console.log(`Request: ${userRequest}`);

  let plan;

  if (useAI) {
    console.log("Provider: GPT-5 Nano");

    plan =
      await generateAIPlan(userRequest);

  } else {
    console.log(
      "Provider: Offline fallback"
    );

    console.log(
      "Reason: LLM API is currently unavailable."
    );

    plan =
      generateOfflinePlan(userRequest);
  }

  await fs.writeFile(
    outputPath,
    JSON.stringify(plan, null, 2),
    "utf8"
  );

  console.log(
    `\n✅ Test plan generated.`
  );

  console.log(
    `📄 Saved to: ${outputPath}`
  );

  console.log(
    `🧪 Steps: ${plan.steps.length}`
  );

  console.log(
    `⚙️ Generated by: ${plan.generatedBy}`
  );
}

main().catch((error) => {
  console.error(
    "\n❌ Test generation failed."
  );

  console.error(error.message);

  process.exit(1);
});