/**
 * ============================================================
 * PREVIA Core
 * Order Defaults
 * ============================================================
 *
 * Default values for new orders.
 * These values are set by Core, server-side.
 * App cannot override them.
 * ============================================================
 */

const ORDER_DEFAULTS = Object.freeze({

  source: "vintage_app",

  payment_type: "full",

  order_status: "new",

  payment_status: "pending"

});

export {
  ORDER_DEFAULTS
};
