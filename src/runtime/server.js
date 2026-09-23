/**
 * PREVIA Core - HTTP Runtime
 */

import http from "node:http";

import {
  OrderService,
  CmsOrderRepository,
  CmsProductRepository,
  CmsCustomerRepository,
  CmsFavoritesRepository,
  ProductOrderEnrichmentService,
  CustomerService,
  FavoritesManager,
  OrderEndpoint,
  CustomerEndpoint,
  FavoritesEndpoint,
  OrderHttpHandler,
  TelegramIdentityVerifier,
  TelegramLoginVerifier,
  TelegramOidcVerifier,
  TelegramNotificationService
} from "../index.js";

const PORT = Number(process.env.PORT) || 3000;
const CMS_URL = process.env.PREVIA_CMS_URL;
const HMAC_SECRET = process.env.PREVIA_CORE_HMAC_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.PREVIA_TELEGRAM_BOT_TOKEN;
const TELEGRAM_OIDC_CLIENT_ID = process.env.PREVIA_TELEGRAM_OIDC_CLIENT_ID || "8970735353";
const TELEGRAM_ADMIN_CHAT_ID = process.env.PREVIA_ADMIN_CHAT_ID;
const TELEGRAM_THREAD_ID = process.env.PREVIA_TELEGRAM_THREAD_ID || null;
const TELEGRAM_INIT_DATA_MAX_AGE = Number(process.env.PREVIA_TELEGRAM_INIT_DATA_MAX_AGE_SECONDS) || 86400;
const TELEGRAM_LOGIN_MAX_AGE = Number(process.env.PREVIA_TELEGRAM_LOGIN_MAX_AGE_SECONDS) || 86400;
const TELEGRAM_OIDC_MAX_AGE = Number(process.env.PREVIA_TELEGRAM_OIDC_MAX_AGE_SECONDS) || 600;

if (!CMS_URL) throw new Error("PREVIA_CMS_URL environment variable is required");
if (!HMAC_SECRET) throw new Error("PREVIA_CORE_HMAC_SECRET environment variable is required");
if (!TELEGRAM_BOT_TOKEN) throw new Error("PREVIA_TELEGRAM_BOT_TOKEN environment variable is required");
if (!TELEGRAM_ADMIN_CHAT_ID) throw new Error("PREVIA_ADMIN_CHAT_ID environment variable is required");
if (!TELEGRAM_OIDC_CLIENT_ID) throw new Error("PREVIA_TELEGRAM_OIDC_CLIENT_ID environment variable is required");

const orderRepository = new CmsOrderRepository(CMS_URL, HMAC_SECRET);
const productRepository = new CmsProductRepository(CMS_URL);
const customerRepository = new CmsCustomerRepository(CMS_URL, HMAC_SECRET);
const favoritesRepository = new CmsFavoritesRepository(CMS_URL, HMAC_SECRET);
const productEnrichmentService = new ProductOrderEnrichmentService(productRepository);
const customerService = new CustomerService(customerRepository);
const favoritesManager = new FavoritesManager(favoritesRepository);
const telegramNotificationService = new TelegramNotificationService(TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, null, TELEGRAM_THREAD_ID);
const orderService = new OrderService(orderRepository, productEnrichmentService, telegramNotificationService);
const orderEndpoint = new OrderEndpoint(orderService);
const customerEndpoint = new CustomerEndpoint(customerService);
const favoritesEndpoint = new FavoritesEndpoint(favoritesManager);

const telegramIdentityVerifier = new TelegramIdentityVerifier(TELEGRAM_BOT_TOKEN, TELEGRAM_INIT_DATA_MAX_AGE);
const telegramLoginVerifier = new TelegramLoginVerifier(TELEGRAM_BOT_TOKEN, TELEGRAM_LOGIN_MAX_AGE);
const telegramOidcVerifier = new TelegramOidcVerifier(TELEGRAM_OIDC_CLIENT_ID, {
  maxAgeSeconds: TELEGRAM_OIDC_MAX_AGE
});
const orderHttpHandler = new OrderHttpHandler(
  orderEndpoint,
  telegramIdentityVerifier,
  telegramOidcVerifier,
  telegramLoginVerifier
);

function getAllowedOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return null;
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    if ([
      "previa-vintage.shop",
      "www.previa-vintage.shop",
      "restforeverything2025-eng.github.io",
      "localhost",
      "127.0.0.1"
    ].includes(hostname)) return origin;
  } catch {}
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
        reject(Object.assign(new Error("Request body is too large"), { code: "PAYLOAD_TOO_LARGE" }));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch { reject(new Error("INVALID_JSON")); }
    });
    request.on("error", reject);
  });
}

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function authenticateClient(body) {
  if (body && typeof body.telegram_init_data === "string") {
    return telegramIdentityVerifier.verify(body.telegram_init_data);
  }
  if (body && typeof body.telegram_id_token === "string") {
    const options = {};
    if (typeof body.telegram_oidc_nonce === "string" && body.telegram_oidc_nonce.trim()) {
      options.nonce = body.telegram_oidc_nonce;
    }
    return telegramOidcVerifier.verify(body.telegram_id_token, options);
  }
  if (body && body.telegram_login && typeof body.telegram_login === "object") {
    return telegramLoginVerifier.verify(body.telegram_login);
  }
  throw Object.assign(new Error("Telegram authentication is required"), { code: "AUTHENTICATION_ERROR", retryable: false });
}

function stripAuthentication(body) {
  const { telegram_init_data, telegram_login, telegram_id_token, telegram_oidc_nonce, ...data } = body || {};
  return data;
}

async function handleCustomerRequest(body) {
  const identity = await authenticateClient(body);
  if (body.action === "customer.find") {
    const customer = await customerEndpoint.find(identity);
    return { success: true, customer };
  }
  if (body.action === "customer.getOrCreate") {
    const customer = await customerEndpoint.getOrCreate({
      ...identity,
      displayName: identity.telegram_name,
      username: identity.telegram_username
    });
    return { success: true, customer };
  }
  throw Object.assign(new Error("Unknown customer action"), { code: "VALIDATION_ERROR", retryable: false });
}

async function handleFavoritesRequest(body) {
  const identity = await authenticateClient(body);
  const customer = await customerEndpoint.getOrCreate({
    ...identity,
    displayName: identity.telegram_name,
    username: identity.telegram_username
  });
  const data = stripAuthentication(body);
  const customerId = customer.customerId;
  if (body.action === "favorites.get") return { success: true, favorites: await favoritesEndpoint.getFavorites(customerId) };
  if (body.action === "favorites.add") return { success: true, favorite: await favoritesEndpoint.addFavorite(customerId, data.productId) };
  if (body.action === "favorites.remove") return { success: true, removed: await favoritesEndpoint.removeFavorite(customerId, data.productId) };
  if (body.action === "favorites.sync") return { success: true, favorites: await favoritesEndpoint.syncFavorites(customerId, data.productIds) };
  throw Object.assign(new Error("Unknown favorites action"), { code: "VALIDATION_ERROR", retryable: false });
}

const server = http.createServer(async (request, response) => {
  try {
    applyCors(request, response);
    if (request.method === "OPTIONS" && ["/api/orders", "/api/customer", "/api/favorites"].includes(request.url)) {
      response.writeHead(204);
      response.end();
      return;
    }
    if (request.method === "POST") {
      const body = await readJsonBody(request);
      if (request.url === "/api/orders") {
        const result = await orderHttpHandler.create({ method: request.method, body });
        sendJson(response, result.status, result.body);
        return;
      }
      if (request.url === "/api/customer") {
        sendJson(response, 200, await handleCustomerRequest(body));
        return;
      }
      if (request.url === "/api/favorites") {
        sendJson(response, 200, await handleFavoritesRequest(body));
        return;
      }
    }
    sendJson(response, 404, { success: false, code: "NOT_FOUND", retryable: false, message: "Endpoint not found" });
  } catch (error) {
    const code = error.code || (error.message === "INVALID_JSON" ? "INVALID_JSON" : "INTERNAL_ERROR");
    const status = code === "INVALID_JSON" ? 400 : code === "PAYLOAD_TOO_LARGE" ? 413 : code === "AUTHENTICATION_ERROR" ? 401 : code === "VALIDATION_ERROR" ? 400 : code === "PERSISTENCE_ERROR" ? 502 : 500;
    console.error("PREVIA HTTP request failed", { code, message: error.message || "Internal server error" });
    sendJson(response, status, { success: false, code, retryable: error.retryable || false, message: error.message || "Internal server error" });
  }
});

server.listen(PORT, () => console.log(`PREVIA Core listening on port ${PORT}`));
