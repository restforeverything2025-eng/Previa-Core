/**

 * ============================================================

 * PREVIA Core

 * Validation Service

 * ============================================================

 */



/**

 * Validates an entity.

 *

 * @param {string} type

 * @param {Object} entity

 * @returns {Array<Object>}

 */

function validate(type, entity) {



  switch (type) {



    case "product":

      return validateProduct(entity);



    default:

      return [{

        code: ERROR_CODES.UNKNOWN_ENTITY,

        field: null

      }];



  }



}