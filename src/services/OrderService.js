/**
 * ============================================================
 * PREVIA Core
 * Order Service
 * ============================================================
 *
 * Handles Order creation and preparation.
 *
 * Does not know about:
 * - Google Sheets
 * - Telegram
 * - payments
 * - reservations
 * - notifications
 * ============================================================
 */

import { randomUUID } from "crypto";

import {
  Order,
  OrderItem
} from "../domain/index.js";

import {
  validate
} from "./ValidationService.js";

import {
  ORDER_DEFAULTS
} from "../constants/OrderDefaults.js";

class OrderService {
  constructor(repository = null) {
    this.repository = repository;
  }

  createOrder(data = {}) {
    const errors = validate("order", data);

    if (errors.length > 0) {
      const error = new Error(
        "Order validation failed: " + errors.join(", ")
      );
      error.code = "VALIDATION_ERROR";
      error.retryable = false;
      error.details = errors;
      throw error;
    }

    const orderId = "ORD-" + randomUUID();
    const createdAt = new Date().toISOString();

    const order = new Order({
      ...data,
      order_id: orderId,
      created_at: createdAt,
      source: ORDER_DEFAULTS.source,
      payment_type: ORDER_DEFAULTS.payment_type,
      order_status: ORDER_DEFAULTS.order_status,
      payment_status: ORDER_DEFAULTS.payment_status
    });

    const items = (data.items || []).map(item => {
      return new OrderItem({
        order_id: order.order_id,
        sku: item.sku,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      });
    });

    const subtotal = items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    order.subtotal = subtotal;
    order.total = subtotal;

    return { order, items };
  }

  async saveOrder(data = {}) {
    const result = this.createOrder(data);

    if (!this.repository) {
      return result;
    }

    await this.repository.save(
      result.order,
      result.items
    );

    // CMS returns an acknowledgement rather than the full canonical entity.
    // Core remains the source of the generated order_id/timestamp/totals.
    return result;
  }
}

export {
  OrderService
};
