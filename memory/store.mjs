import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORY_PATH = path.join(__dirname, "application.json");

async function loadMemory() {
  try {
    const content = await fs.readFile(MEMORY_PATH, "utf8");
    return JSON.parse(content);
  } catch {
    return {
      version: 1,
      elements: {},
    };
  }
}

async function saveMemory(memory) {
  await fs.writeFile(
    MEMORY_PATH,
    JSON.stringify(memory, null, 2),
    "utf8"
  );
}

export async function getRememberedSelector(key) {
  const memory = await loadMemory();

  return memory.elements?.[key] || null;
}

export async function rememberSelector(key, data) {
  const memory = await loadMemory();

  memory.elements[key] = {
    ...data,
    lastVerified: new Date().toISOString(),
  };

  await saveMemory(memory);
}

export async function markVerified(key) {
  const memory = await loadMemory();

  const entry = memory.elements?.[key];

  if (!entry) {
    return;
  }

  entry.verifiedRuns = (entry.verifiedRuns || 0) + 1;
  entry.lastVerified = new Date().toISOString();

  await saveMemory(memory);
}