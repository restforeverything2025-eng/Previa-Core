/**
 * ============================================================
 * PREVIA Core
 * Order API Integration Test
 * ============================================================
 */

const CMS_URL =
  "https://script.google.com/macros/s/AKfycbxWHGxRB3Edb5_cMZocgqswx7I_y4KKCb67RwTVYBMoqoTCvLTTXXOmsmGw9af3i2I8Fg/exec";


const testOrder = {

  order: {

    order_id: "TEST-API-001",
    created_at: new Date().toISOString(),
    source: "telegram",
    customerId: "",
    provider: "telegram",
    providerId: "1234567890",
    telegram_username: "",
    telegram_name: "",
    customer_name: "API Test Customer",
    phone: "+380000000000",
    email: "api@test.com",
    payment_type: "full",
    payment_method: "card",
    payment_status: "",
    order_status: "new",
    subtotal: 175,
    total: 175,
    expires_at: "",
    paid_at: "",
    document_url: "",
    note: "API integration test"

  },

  items: [

    {
      order_id: "TEST-API-001",
      sku: "W0098",
      title: "API Test Watch",
      price: 175,
      quantity: 1,
      subtotal: 175
    }

  ]

};


async function createOrder() {

  const response =
    await fetch(
      CMS_URL,
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          action: "order.create",

          data: testOrder

        })

      }
    );


  const responseText =
    await response.text();


  console.log(
    "Create HTTP status:",
    response.status
  );

  console.log(
    "Create Content-Type:",
    response.headers.get(
      "content-type"
    )
  );

  console.log(
    "Create raw response:"
  );

  console.log(
    responseText
  );

}


async function findOrder() {

  const response =
    await fetch(
      CMS_URL,
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          action: "order.find",

          data: {

            order_id:
              "TEST-API-001"

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

  await createOrder();

  await findOrder();

}


run().catch(
  error => {

    console.error(
      "API test failed:"
    );

    console.error(
      error
    );

  }
);
