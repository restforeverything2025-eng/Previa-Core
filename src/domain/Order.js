/**
 * ==========================================
 * PREVIA Order Domain Entity
 * ==========================================
 *
 * Represents one purchase order.
 *
 * Business rules belong to services.
 * This entity represents the order state.
 * ==========================================
 */

class Order {

  constructor(data = {}) {

    this.order_id = data.order_id || null;

    this.created_at = data.created_at || null;

    this.source = data.source || "";

    this.customerId = data.customerId || "";

    this.provider = data.provider || "";

    this.providerId = data.providerId || "";

    this.telegram_username =
      data.telegram_username || "";

    this.telegram_name =
      data.telegram_name || "";

    this.customer_name =
      data.customer_name || "";

    this.phone =
      data.phone || "";

    this.email =
      data.email || "";
    
    this.contact_preferences =
      Array.isArray(data.contact_preferences)
        ? data.contact_preferences
        : [];

    this.payment_type =
      data.payment_type || "";

    this.payment_method =
      data.payment_method || "";

    this.payment_status =
      data.payment_status || "";

    this.order_status =
      data.order_status || "";

    this.subtotal =
      data.subtotal || 0;

    this.total =
      data.total || 0;

    this.expires_at =
      data.expires_at || "";

    this.paid_at =
      data.paid_at || "";

    this.document_url =
      data.document_url || "";

    this.note =
      data.note || "";
  }

}

export { Order };