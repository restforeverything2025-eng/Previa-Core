/**
 * ============================================================
 * PREVIA Core
 * Product API Integration Test
 * ============================================================
 */

const CMS_URL =
  "https://script.google.com/macros/s/AKfycbxWHGxRB3Edb5_cMZocgqswx7I_y4KKCb67RwTVYBMoqoTCvLTTXXOmsmGw9af3i2I8Fg/exec";


async function findProduct(sku) {

  const response =
    await fetch(
      CMS_URL,
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          action: "product.find",

          data: {
            sku: sku
          }

        })

      }
    );


  const responseText =
    await response.text();


  console.log(
    "Find HTTP status:",
    response.status
  );

  console.log(
    "Find Content-Type:",
    response.headers.get(
      "content-type"
    )
  );

  console.log(
    "Find raw response:"
  );

  console.log(
    responseText
  );

}


async function run() {

  console.log(
    "=== EXISTING PRODUCT ==="
  );

  await findProduct(
    "J0001"
  );


  console.log(
    "=== MISSING PRODUCT ==="
  );

  await findProduct(
    "TEST-NOT-EXISTS"
  );

}


run().catch(
  error => {

    console.error(
      "Product API test failed:"
    );

    console.error(
      error
    );

  }
);
