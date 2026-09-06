/**
 * PREVIA Core - Order Service
 * Handles canonical order creation and persistence.
 */

import { Order, OrderItem } from "../domain/index.js";
import { validate } from "./ValidationService.js";
import { ORDER_DEFAULTS } from "../constants/OrderDefaults.js";
import { createDeterministicOrderId, validateIdempotencyKey, ordersEquivalent } from "./OrderIdempotencyService.js";

class OrderService {
  constructor(repository = null, productEnrichmentService = null) {
    this.repository = repository;
    this.productEnrichmentService = productEnrichmentService;
  }

  async createOrder(data = {}) {
    if (this.productEnrichmentService) {
      data = {
        ...data,
        items: await this.productEnrichmentService.enrichItems(data.items)
      };
    }

    const errors = validate("order", data);
    if (errors.length > 0) {
      const error = new Error("Order validation failed: " + errors.join(", "));
      error.code = "VALIDATION_ERROR";
      error.retryable = false;
      error.details = errors;
      throw error;
    }

    const keyError = validateIdempotencyKey(data.idempotency_key);
    if (keyError) {
      const error = new Error(keyError);
      error.code = "VALIDATION_ERROR";
      error.retryable = false;
      error.details = [keyError];
      throw error;
    }

    const orderId = createDeterministicOrderId(data.provider, data.providerId, data.idempotency_key);

    if (this.repository) {
      const existing = await this.repository.findById(orderId);
      if (existing) {
        const existingComparable = {
          ...existing.order,
          items: existing.items
        };

        if (!ordersEquivalent(existingComparable, { ...data, items: data.items })) {
          const error = new Error("Idempotency key was already used for a different order");
          error.code = "IDEMPOTENCY_CONFLICT";
          error.retryable = false;
          error.details = ["idempotency_key already belongs to another order"];
          throw error;
        }
        return { order: existing.order, items: existing.items, idempotent: true };
      }
    }

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

    const items = data.items.map(item => new OrderItem({
      order_id: order.order_id,
      sku: item.sku,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }));

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    order.subtotal = subtotal;
    order.total = subtotal;

    return { order, items, idempotent: false };
  }

  async saveOrder(data = {}) {
    const result = await this.createOrder(data);
    if (!this.repository || result.idempotent) return result;
    await this.repository.save(result.order, result.items);
    return result;
  }
}

export { OrderService };
