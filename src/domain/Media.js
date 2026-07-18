/**
 * ============================================================
 * PREVIA Core
 * Domain Model: Media
 * ============================================================
 */

const MEDIA_DEFAULTS = Object.freeze({

  id: "",

  fileName: "",

  url: "",

  thumbnailUrl: "",

  width: 0,

  height: 0,

  sortOrder: 0,

  alt: ""

});

/**
 * Creates a Media domain object.
 *
 * @param {Object} data
 * @returns {Object}
 */
function createMedia(data = {}) {

  return {

    ...MEDIA_DEFAULTS,

    ...data,

    width: Number(data.width ?? MEDIA_DEFAULTS.width),

    height: Number(data.height ?? MEDIA_DEFAULTS.height),

    sortOrder: Number(data.sortOrder ?? MEDIA_DEFAULTS.sortOrder)

  };

}