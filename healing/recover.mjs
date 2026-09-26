import "dotenv/config";
import { z } from "zod";
import { generateText } from "../llm/provider.mjs";

const RecoverySchema = z.object({
  selector: z.string(),
  reason: z.string(),
  confidence: z.number().min(0).max(1),
});

function extractJson(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

export async function recoverElement(
  page,
  intent,
  failedSelector,
  memoryKey
) {
  console.log("\n🔧 SELF-HEALING STARTED");
  console.log(`Original intent: ${intent}`);
  console.log(`Failed selector: ${failedSelector}`);

  // --------------------------------------------------
  // 1. CHECK MEMORY FIRST
  // --------------------------------------------------

  const { getRememberedSelector } =
    await import("../memory/store.mjs");

  const remembered =
    await getRememberedSelector(memoryKey);

  if (remembered?.currentSelector) {
    console.log("\n🧠 Memory lookup:");
    console.log(
      `Known selector: ${remembered.currentSelector}`
    );

    const rememberedElement =
      page.locator(remembered.currentSelector);

    const count =
      await rememberedElement.count();

    if (count === 1) {
      console.log(
        "✅ Memory hit — no AI call needed."
      );

      return {
        selector: remembered.currentSelector,
        reason:
          "Previously verified selector from application memory.",
        confidence: remembered.confidence ?? 1,
        source: "memory",
        modelCalls: 0,
      };
    }

    console.log(
      "⚠️ Remembered selector is no longer valid."
    );
  }

  // --------------------------------------------------
  // 2. INSPECT CURRENT PAGE
  // --------------------------------------------------

  const candidates =
    await page
      .locator(
        "button, a, input, select, textarea, [role='button']"
      )
      .evaluateAll((elements) => {
        return elements.map(
          (element, index) => ({
            index,
            tag:
              element.tagName.toLowerCase(),
            id:
              element.id || null,
            text:
              element.innerText?.trim() || "",
            ariaLabel:
              element.getAttribute("aria-label"),
            role:
              element.getAttribute("role"),
            testId:
              element.getAttribute("data-testid"),
            name:
              element.getAttribute("name"),
            type:
              element.getAttribute("type"),
          })
        );
      });

  console.log(
    "\n🔍 Current page candidates:"
  );

  console.log(
    JSON.stringify(
      candidates,
      null,
      2
    )
  );

  // --------------------------------------------------
  // 3. ASK GEMINI
  // --------------------------------------------------

  const prompt = `
You are the self-healing engine of an autonomous UI testing system.

A browser test wants to perform this BUSINESS ACTION:

"${intent}"

The original selector that worked previously was:

"${failedSelector}"

It no longer exists.

These are the CURRENT interactive elements on the page:

${JSON.stringify(candidates, null, 2)}

Your task:

Find the element that represents the SAME business action.

IMPORTANT RULES:

1. Prefer semantic/business meaning.
2. Do not choose unrelated buttons.
3. Do not invent elements.
4. Only use information present in the candidate list.
5. Prefer a stable ID or data-testid when available.
6. Return ONLY valid JSON.
7. Do not wrap the JSON in markdown.
8. Confidence must be between 0 and 1.

Return exactly:

{
  "selector": "CSS selector",
  "reason": "brief explanation",
  "confidence": 0.0
}
`;

  const aiResponse =
    await generateText(prompt);

  const aiText =
    aiResponse.text;

  const usedModel =
    aiResponse.model;

  let recovery;

  try {
    recovery =
      RecoverySchema.parse(
        extractJson(aiText)
      );
  } catch {
    throw new Error(
      `Gemini returned invalid recovery JSON: ${aiText}`
    );
  }

  console.log(
    "\n🤖 Gemini recovery decision:"
  );

  console.log(
    `New selector: ${recovery.selector}`
  );

  console.log(
    `Reason: ${recovery.reason}`
  );

  console.log(
    `Confidence: ${recovery.confidence}`
  );

  console.log(
    `Model: ${usedModel}`
  );

  // --------------------------------------------------
  // 4. VERIFY GEMINI'S DECISION
  // --------------------------------------------------

  const recoveredElement =
    page.locator(
      recovery.selector
    );

  const count =
    await recoveredElement.count();

  if (count !== 1) {
    throw new Error(
      `Gemini suggested selector "${recovery.selector}" but it matched ${count} elements.`
    );
  }

  console.log(
    "✅ Recovery candidate verified in browser."
  );

  return {
    selector:
      recovery.selector,

    reason:
      recovery.reason,

    confidence:
      recovery.confidence,

    source:
      "ai",

    modelCalls:
      1,

    model:
      usedModel,
  };
}