/**
 * ============================================================
 * PREVIA Core
 * HTTP Runtime
 * ============================================================
 *
 * Production entry point for PREVIA Core.
 * ============================================================
 */

import http from "node:http";

import {
  OrderService,
  CmsOrderRepository,
  OrderEndpoint,
  OrderHttpHandler,
  TelegramIdentityVerifier
} from "../index.js";

const PORT = Number(process.env.PORT) || 3000;
const CMS_URL = process.env.PREVIA_CMS_URL;
const HMAC_SECRET = process.env.PREVIA_CORE_HMAC_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.PREVIA_TELEGRAM_BOT_TOKEN;
const TELEGRAM_INIT_DATA_MAX_AGE =
  Number(process.env.PREVIA_TELEGRAM_INIT_DATA_MAX_AGE_SECONDS) || 86400;

if (!CMS_URL) {
  throw new Error("PREVIA_CMS_URL environment variable is required");
}

if (!HMAC_SECRET) {
  throw new Error("PREVIA_CORE_HMAC_SECRET environment variable is required");
}

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("PREVIA_TELEGRAM_BOT_TOKEN environment variable is required");
}

const repository = new CmsOrderRepository(
  CMS_URL,
  HMAC_SECRET
);

const orderService = new OrderService(repository);
const orderEndpoint = new OrderEndpoint(orderService);
const identityVerifier = new TelegramIdentityVerifier(
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_INIT_DATA_MAX_AGE
);
const orderHttpHandler = new OrderHttpHandler(
  orderEndpoint,
  identityVerifier
);

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", chunk => {
      body += chunk;

      // Protect the public endpoint from unexpectedly large request bodies.
      if (Buffer.byteLength(body, "utf8") > 1024 * 1024) {
        reject(Object.assign(
          new Error("Request body is too large"),
          { code: "PAYLOAD_TOO_LARGE" }
        ));
        request.destroy();
      }
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("INVALID_JSON"));
      }
    });

    request.on("error", reject);
  });
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8"
  });

  response.end(JSON.stringify(body));
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "POST" && request.url === "/api/orders") {
      const body = await readJsonBody(request);

      const result = await orderHttpHandler.create({
        method: request.method,
        body
      });

      sendJson(response, result.status, result.body);
      return;
    }

    sendJson(response, 404, {
      success: false,
      code: "NOT_FOUND",
      retryable: false,
      message: "Endpoint not found"
    });
  } catch (error) {
    const code = error.code ||
      (error.message === "INVALID_JSON" ? "INVALID_JSON" : "INTERNAL_ERROR");

    const status = code === "INVALID_JSON"
      ? 400
      : code === "PAYLOAD_TOO_LARGE"
        ? 413
        : 500;

    sendJson(response, status, {
      success: false,
      code,
      retryable: false,
      message: error.message || "Internal server error"
    });
  }
});

server.listen(PORT, () => {
  console.log(`PREVIA Core listening on port ${PORT}`);
});
