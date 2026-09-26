import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_PATH = path.join(__dirname, "runs.json");

async function loadReports() {
  try {
    const content = await fs.readFile(REPORT_PATH, "utf8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function saveReport(report) {
  const reports = await loadReports();

  reports.push({
    ...report,
    timestamp: new Date().toISOString(),
  });

  await fs.writeFile(
    REPORT_PATH,
    JSON.stringify(reports, null, 2),
    "utf8"
  );
}

export async function getReports() {
  return await loadReports();
}