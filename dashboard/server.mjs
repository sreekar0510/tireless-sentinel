import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardDirectory = path.join(
  __dirname,
  "public"
);

const projectDirectory = path.join(
  __dirname,
  ".."
);

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(
      req.url,
      "http://localhost:3001"
    );
// ------------------------------------------
// RUN TEST SCENARIO
// ------------------------------------------

if (requestUrl.pathname === "/api/run") {

  const scenario =
    requestUrl.searchParams.get("scenario") ||
    "baseline";

  const allowedScenarios = [
    "baseline",
    "ui-change",
    "bug",
  ];

  if (!allowedScenarios.includes(scenario)) {

    res.writeHead(400, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        error: "Invalid scenario",
      })
    );

    return;
  }

  const { spawn } =
    await import("child_process");

  const child =
    spawn(
      "node",
      [
        "test-checkout.mjs",
        scenario,
      ],
      {
        cwd: projectDirectory,
        env: process.env,
      }
    );

  let output = "";

  child.stdout.on(
    "data",
    (data) => {
      output += data.toString();
    }
  );

  child.stderr.on(
    "data",
    (data) => {
      output += data.toString();
    }
  );

  child.on(
    "close",
    (code) => {

      res.writeHead(
        code === 0 ? 200 : 500,
        {
          "Content-Type":
            "application/json",
        }
      );

      res.end(
        JSON.stringify({
          success: code === 0,
          exitCode: code,
          output,
        })
      );
    }
  );

  return;
}
    // ------------------------------------------
    // RUN REPORTS API
    // ------------------------------------------

    if (requestUrl.pathname === "/api/runs") {
      const file = path.join(
        projectDirectory,
        "reports",
        "runs.json"
      );

      let data = [];

      try {
        data = JSON.parse(
          await fs.readFile(file, "utf8")
        );
      } catch {
        data = [];
      }

      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      res.end(JSON.stringify(data));
      return;
    }

    // ------------------------------------------
    // MEMORY API
    // ------------------------------------------

    if (requestUrl.pathname === "/api/memory") {
      const file = path.join(
        projectDirectory,
        "memory",
        "application.json"
      );

      let data = {
        version: 1,
        elements: {},
      };

      try {
        data = JSON.parse(
          await fs.readFile(file, "utf8")
        );
      } catch {
        // Use empty memory if unavailable.
      }

      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      res.end(JSON.stringify(data));
      return;
    }

    // ------------------------------------------
    // DASHBOARD FILES
    // ------------------------------------------

    const fileName =
      requestUrl.pathname === "/"
        ? "index.html"
        : requestUrl.pathname.slice(1);

    const filePath = path.join(
      dashboardDirectory,
      fileName
    );

    const content = await fs.readFile(
      filePath
    );

    const extension = path.extname(filePath);

    const contentTypes = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
    };

    res.writeHead(200, {
      "Content-Type":
        contentTypes[extension] ||
        "application/octet-stream",
    });

    res.end(content);

  } catch (error) {
    console.error("Dashboard error:", error);

    res.writeHead(404, {
      "Content-Type": "text/plain",
    });

    res.end("Not Found");
  }
});

server.listen(3001, () => {
  console.log(
    "🛡️ Tireless Sentinel dashboard running at http://localhost:3001"
  );
});