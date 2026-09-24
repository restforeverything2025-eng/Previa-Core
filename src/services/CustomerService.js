/**
 * ============================================================
 * PREVIA Core
 * Customer Service
 * ============================================================
 *
 * Coordinates customer identity records through a repository.
 * Authentication remains outside Core.
 * ============================================================
 */

class CustomerService {
  constructor(repository) {
    if (!repository) {
      throw new Error("Customer repository is required.");
    }

    this.repository = repository;
  }

  async findById(customerId) {
    return this.repository.findById(customerId);
  }

  async findByProvider(provider, providerId) {
    return this.repository.findByProvider(provider, providerId);
  }

  async getOrCreate(identity) {
    if (!identity || identity.provider === undefined || identity.providerId === undefined) {
      throw new Error("Customer identity is required.");
    }

    const existing = await this.repository.findByProvider(
      identity.provider,
      identity.providerId
    );

    if (existing) {
      const next = {
        ...existing,
        displayName: identity.displayName ?? existing.displayName,
        username: identity.username ?? existing.username,
        updatedAt: new Date().toISOString()
      };

      if (
        next.displayName !== existing.displayName ||
        next.username !== existing.username
      ) {
        return this.repository.save(next);
      }

      return existing;
    }

    return this.repository.save({
      customerId: "",
      provider: String(identity.provider),
      providerId: String(identity.providerId),
      displayName: String(identity.displayName || ""),
      username: String(identity.username || ""),
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
}

export { CustomerService };
