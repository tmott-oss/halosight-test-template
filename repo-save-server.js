const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const repoRoot = __dirname;
const indexPath = path.join(repoRoot, "index.html");
const port = Number(process.env.REPO_SAVE_PORT || 5175);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20 * 1024 * 1024) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function validateHtml(html) {
  return typeof html === "string"
    && html.includes("<!doctype html>")
    && html.includes("Template Editor")
    && html.includes("halosight")
    && html.includes('src="./script.js"');
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { ok: true, repoRoot, indexPath });
    return;
  }

  if (request.method !== "POST" || request.url !== "/save-to-repo") {
    sendJson(response, 404, { ok: false, error: "Not found." });
    return;
  }

  try {
    const body = await readBody(request);
    const payload = JSON.parse(body);

    if (!validateHtml(payload.html)) {
      sendJson(response, 400, { ok: false, error: "Refusing to save unexpected HTML payload." });
      return;
    }

    await fs.writeFile(indexPath, `${payload.html.trimEnd()}\n`, "utf8");
    sendJson(response, 200, { ok: true, saved: indexPath, bytes: Buffer.byteLength(payload.html, "utf8") });
  } catch (error) {
    sendJson(response, 500, { ok: false, error: error.message });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Repo save server listening at http://127.0.0.1:${port}`);
  console.log(`Saving edits to ${indexPath}`);
});
