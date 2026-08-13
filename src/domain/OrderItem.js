/**
 * ==========================================
 * PREVIA OrderItem Domain Entity
 * ==========================================
 *
 * Represents one product captured
 * in a specific order.
 * ==========================================
 */

class OrderItem {

  constructor(data = {}) {

    this.order_id =
      data.order_id || "";

    this.sku =
      data.sku || "";

    this.title =
      data.title || "";

    this.price =
      data.price || 0;

    this.quantity =
      data.quantity || 1;

    this.subtotal =
      data.subtotal || 0;
  }

}

export { OrderItem };