import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDirectory = path.join(__dirname, "public");

const server = http.createServer((req, res) => {
  // Ignore query parameters when finding the file.
  const requestUrl = new URL(
    req.url,
    "http://localhost:3000"
  );

  const pathname = requestUrl.pathname;

  const filePath = path.join(
    publicDirectory,
    pathname === "/" ? "index.html" : pathname
  );

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, {
      "Content-Type": "text/plain",
    });

    res.end("Not Found");
    return;
  }

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

  fs.createReadStream(filePath).pipe(res);
});

server.listen(3000, () => {
  console.log(
    "CloudCart running at http://localhost:3000"
  );
});