import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const primaryModel =
  process.env.GEMINI_MODEL || "gemini-3.8-flash";

const fallbackModel =
  process.env.GEMINI_FALLBACK_MODEL ||
  "gemini-3.7-flash";

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY is missing from .env"
  );
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function sleep(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

async function callModel(model, prompt) {
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response =
        await ai.models.generateContent({
          model,
          contents: prompt,
        });

      return {
        text: response.text,
        model,
      };

    } catch (error) {
      const status = error.status;

      // Retry transient service errors.
      if (
        (status === 503 || status === 429) &&
        attempt < maxRetries
      ) {
        const delay =
          1500 * Math.pow(2, attempt);

        console.log(
          `⚠️ ${model} unavailable. Retrying in ${delay}ms...`
        );

        await sleep(delay);
        continue;
      }

      throw error;
    }
  }
}

export async function generateText(prompt) {

  try {
    const result =
      await callModel(
        primaryModel,
        prompt
      );

    console.log(
      `🤖 LLM: ${result.model}`
    );

    return {
      text: result.text,
      model: result.model,
    };

  } catch (error) {

    if (
      error.status === 503 ||
      error.status === 429
    ) {

      console.log(
        `⚠️ ${primaryModel} unavailable. Switching to ${fallbackModel}...`
      );

      const fallback =
        await callModel(
          fallbackModel,
          prompt
        );

      console.log(
        `🤖 LLM fallback: ${fallback.model}`
      );

      return {
        text: fallback.text,
        model: fallback.model,
      };
    }

    throw error;
  }
}

export function getProviderInfo() {
  return {
    provider: "gemini",
    primaryModel,
    fallbackModel,
  };
}