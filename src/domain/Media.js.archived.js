/**
 * ============================================================
 * PREVIA Core
 * Domain Model: Media
 * ============================================================
 */

import {
  assertPlainObject
} from "../utils/FactoryUtils.js";

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
 * @param {Object} [data={}] Initial media data.
 * @returns {Object} Media domain object.
 */
function createMedia(data = {}) {

  data = assertPlainObject(data, "Media");

  return {

    ...MEDIA_DEFAULTS,

    ...data,

    width: Number(data.width ?? MEDIA_DEFAULTS.width),

    height: Number(data.height ?? MEDIA_DEFAULTS.height),

    sortOrder: Number(data.sortOrder ?? MEDIA_DEFAULTS.sortOrder)

  };

}

export {
  createMedia
};