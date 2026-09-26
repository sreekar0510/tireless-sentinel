import "dotenv/config";

import {
  generateText,
  getProviderInfo,
} from "./llm/provider.mjs";

console.log("🤖 LLM Provider Test");

console.log(
  `Provider: ${getProviderInfo().provider}`
);

console.log(
  `Model: ${getProviderInfo().model}`
);

const response =
  await generateText(
    "Reply with exactly: Tireless Sentinel Gemini connected."
  );

console.log(response.text);
console.log(`Model used: ${response.model}`);