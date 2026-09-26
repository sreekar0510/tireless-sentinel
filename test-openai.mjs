import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await client.responses.create({
  model: "gpt-5-nano",
  input: "Reply with exactly: Tireless Sentinel API connected.",
});

console.log(response.output_text);