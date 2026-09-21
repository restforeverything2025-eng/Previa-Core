/**
 * ============================================================
 * PREVIA Core
 * Memory Customer Repository
 * ============================================================
 *
 * Test-only customer repository.
 * ============================================================
 */

class MemoryCustomerRepository {
  constructor(customers = []) {
    this.customers = [...customers];
    this.sequence = this.customers.length;
  }

  async findByProvider(provider, providerId) {
    return this.customers.find(
      customer =>
        customer.provider === String(provider) &&
        customer.providerId === String(providerId)
    ) || null;
  }

  async save(customer) {
    const normalized = {
      ...customer,
      customerId: customer.customerId || `C${String(++this.sequence).padStart(6, "0")}`
    };

    const index = this.customers.findIndex(
      item => item.customerId === normalized.customerId
    );

    if (index >= 0) {
      this.customers[index] = normalized;
    } else {
      this.customers.push(normalized);
    }

    return normalized;
  }
}

export { MemoryCustomerRepository };
