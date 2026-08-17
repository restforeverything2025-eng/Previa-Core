/**
 * ============================================================
 * PREVIA Core
 * Environment Configuration
 * ============================================================
 *
 * Loads and validates CMS configuration from environment.
 * Ensures secrets are never hardcoded; always from process.env.
 *
 * ============================================================
 */

/**
 * Loads CMS configuration from environment variables.
 *
 * @returns {Object} {cmsUrl, hmacSecret}
 * @throws {Error} If required environment variables are missing
 */
function loadCmsConfig() {
  const cmsUrl = process.env.PREVIA_CMS_URL;
  const hmacSecret = process.env.PREVIA_CORE_HMAC_SECRET;

  if (!cmsUrl) {
    throw new Error(
      "Missing required environment variable: PREVIA_CMS_URL"
    );
  }

  if (!hmacSecret) {
    throw new Error(
      "Missing required environment variable: PREVIA_CORE_HMAC_SECRET"
    );
  }

  return {
    cmsUrl,
    hmacSecret
  };
}

export { loadCmsConfig };
