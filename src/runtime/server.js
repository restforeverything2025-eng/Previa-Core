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
  CmsProductRepository,
  ProductOrderEnrichmentService,
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

const productRepository = new CmsProductRepository(CMS_URL);
const productEnrichmentService = new ProductOrderEnrichmentService(
  productRepository
);

const orderService = new OrderService(
  repository,
  productEnrichmentService
);
const orderEndpoint = new OrderEndpoint(orderService);
const identityVerifier = new TelegramIdentityVerifier(
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_INIT_DATA_MAX_AGE
);
const orderHttpHandler = new OrderHttpHandler(
  orderEndpoint,
  identityVerifier
);

function getAllowedOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return null;

  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();

    if (
      hostname === "previa-vintage.shop" ||
      hostname === "www.previa-vintage.shop" ||
      hostname === "restforeverything2025-eng.github.io" ||
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    ) {
      return origin;
    }
  } catch {
    return null;
  }

  return null;
}

function applyCors(request, response) {
  const allowedOrigin = getAllowedOrigin(request);
  if (allowedOrigin) {
    response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    response.setHeader("Vary", "Origin");
  }

  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", chunk => {
      body += chunk;

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
    applyCors(request, response);

    if (request.method === "OPTIONS" && request.url === "/api/orders") {
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.method === "POST" && request.url === "/api/orders") {
      console.log("PREVIA HTTP request POST /api/orders");

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
