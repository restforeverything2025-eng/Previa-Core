/**
 * ============================================================
 * PREVIA Core
 * HTTP Runtime
 * ============================================================
 *
 * Production entry point for PREVIA Core.
 *
 * Responsibilities:
 * - Receive HTTP requests
 * - Build Core application dependencies
 * - Pass order data to OrderHttpHandler
 * - Return JSON responses
 *
 * Does NOT contain business logic.
 *
 * ============================================================
 */

import http from "node:http";

import {
  OrderService,
  CmsOrderRepository,
  OrderEndpoint,
  OrderHttpHandler
} from "../index.js";


const PORT =
  Number(process.env.PORT) || 3000;

const CMS_URL =
  process.env.PREVIA_CMS_URL;

const HMAC_SECRET =
  process.env.PREVIA_CORE_HMAC_SECRET;


if (!CMS_URL) {
  throw new Error(
    "PREVIA_CMS_URL environment variable is required"
  );
}


if (!HMAC_SECRET) {
  throw new Error(
    "PREVIA_CORE_HMAC_SECRET environment variable is required"
  );
}


/**
 * Core application composition.
 *
 * Dependency flow:
 *
 * OrderHttpHandler
 *       ↓
 * OrderEndpoint
 *       ↓
 * OrderService
 *       ↓
 * CmsOrderRepository
 *       ↓
 * Previa-CMS
 */
const repository =
  new CmsOrderRepository(
    CMS_URL,
    HMAC_SECRET
  );


const orderService =
  new OrderService(repository);


const orderEndpoint =
  new OrderEndpoint(orderService);


const orderHttpHandler =
  new OrderHttpHandler(orderEndpoint);


/**
 * Reads request body.
 *
 * @param {http.IncomingMessage} request
 * @returns {Promise<Object>}
 */
function readJsonBody(request) {

  return new Promise((resolve, reject) => {

    let body = "";

    request.on("data", chunk => {
      body += chunk;
    });

    request.on("end", () => {

      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(
          new Error("INVALID_JSON")
        );
      }

    });

    request.on("error", reject);

  });

}


/**
 * Sends JSON response.
 */
function sendJson(response, status, body) {

  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8"
  });

  response.end(
    JSON.stringify(body)
  );

}


/**
 * HTTP server.
 */
const server =
  http.createServer(
    async (request, response) => {

      try {

        if (
          request.method === "POST" &&
          request.url === "/api/orders"
        ) {

          const body =
            await readJsonBody(request);


          const result =
            await orderHttpHandler.create({
              method: request.method,
              body
            });


          sendJson(
            response,
            result.status,
            result.body
          );

          return;
        }


        sendJson(
          response,
          404,
          {
            success: false,
            code: "NOT_FOUND",
            retryable: false,
            message: "Endpoint not found"
          }
        );

      } catch (error) {

        sendJson(
          response,
          400,
          {
            success: false,
            code:
              error.message === "INVALID_JSON"
                ? "INVALID_JSON"
                : "INTERNAL_ERROR",
            retryable: false,
            message:
              error.message || "Internal server error"
          }
        );

      }

    }
  );


server.listen(
  PORT,
  () => {

    console.log(
      `PREVIA Core listening on port ${PORT}`
    );

  }
);
