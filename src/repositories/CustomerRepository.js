/**
 * ============================================================
 * PREVIA Core
 * Customer Repository
 * ============================================================
 *
 * Persistence contract for customers.
 * ============================================================
 */

class CustomerRepository {
  async findByProvider(provider, providerId) {
    throw new Error("CustomerRepository.findByProvider() is not implemented");
  }

  async save(customer) {
    throw new Error("CustomerRepository.save() is not implemented");
  }
}

export { CustomerRepository };
