/**
 * ============================================================
 * PREVIA Core
 * Customer Domain
 * ============================================================
 *
 * Represents a customer identity as known by PREVIA Core.
 * Authentication is performed by an application/provider adapter;
 * Core works with the resulting trusted identity snapshot.
 * ============================================================
 */

import { assertPlainObject } from "../utils/FactoryUtils.js";

const CUSTOMER_DEFAULTS = Object.freeze({
  customerId: "",
  provider: "",
  providerId: "",
  displayName: "",
  username: "",
  status: "active",
  createdAt: "",
  updatedAt: ""
});

function createCustomer(data = {}) {
  data = assertPlainObject(data, "Customer");

  return Object.freeze({
    ...CUSTOMER_DEFAULTS,
    ...data,
    customerId: String(data.customerId ?? CUSTOMER_DEFAULTS.customerId),
    provider: String(data.provider ?? CUSTOMER_DEFAULTS.provider),
    providerId: String(data.providerId ?? CUSTOMER_DEFAULTS.providerId),
    displayName: String(data.displayName ?? CUSTOMER_DEFAULTS.displayName),
    username: String(data.username ?? CUSTOMER_DEFAULTS.username),
    status: String(data.status ?? CUSTOMER_DEFAULTS.status)
  });
}

export {
  CUSTOMER_DEFAULTS,
  createCustomer
};
