# PREVIA Order Integration Architecture

Status: **Validated in production**  
Validated: **2026-09-07**  
Branch: `feature/order-integration`

## 1. Purpose

This document records the working order architecture after end-to-end production validation. It is the reference point for future changes to checkout, order persistence, identity, product authority, and retry handling.

The architecture must preserve the separation of responsibilities between the Vintage App, PREVIA Core, Telegram identity, CMS, and Google Sheets.

---

## 2. Runtime Flow

```text
PREVIA Vintage App
        |
        | HTTPS POST /api/orders
        | + Telegram initData
        | + customer/order draft
        | + idempotency_key
        v
PREVIA Core
        |
        | verify Telegram identity
        | normalize trusted identity
        | validate order
        | resolve authoritative product data
        | calculate totals
        | derive deterministic order_id
        | resolve idempotency
        | sign CMS request with HMAC-SHA256
        v
PREVIA CMS
        |
        | authenticate Core request
        | persist order transactionally
        | persist order items
        v
Google Sheets
        |
        +--> Orders
        +--> OrderItems
```

The client never writes directly to Google Sheets.

---

## 3. Responsibility Boundaries

### Vintage App

Owns:

- UI and checkout interaction
- cart state
- collecting customer input
- collecting Telegram `initData`
- generating/storing the checkout idempotency key for the current attempt
- displaying success or error states

Does **not** own:

- authoritative price
- authoritative product availability
- order identity
- business validation
- persistence
- HMAC secrets

### PREVIA Core

Owns:

- business rules
- Telegram identity verification and normalization
- order validation
- authoritative product resolution
- pricing and totals
- canonical order construction
- deterministic order identity
- idempotency
- concurrency/race protection
- Core → CMS authentication envelope

Core is the trust boundary between the client and persistence infrastructure.

### Telegram Identity

The client sends Telegram `initData`. Core verifies its signature and derives the trusted provider/providerId and Telegram identity snapshot.

Client-supplied identity fields are not trusted over verified Telegram identity.

### PREVIA CMS

Owns infrastructure-side persistence and Google Sheets integration.

CMS does not decide business rules or authoritative order values. It accepts only authenticated, validated Core requests and persists the canonical order.

### Google Sheets

Owns persistent order records for the current implementation.

Sheets is storage, not the business-logic layer.

---

## 4. Product Authority

Browser-supplied product titles and prices are untrusted.

For every order item Core must resolve the SKU against authoritative product data and use the authoritative product information when constructing the canonical order.

Current guarantees validated by automated tests:

- client price cannot override authoritative price;
- client title cannot override authoritative title;
- unknown SKU is rejected;
- unavailable SKU is rejected.

This rule must remain true even if the client UI is modified or bypassed.

---

## 5. Idempotency

Checkout requests carry an idempotency key.

The effective idempotency identity is scoped to the trusted Telegram identity and the deterministic order identity derived by Core.

For a repeated request with the same key and an equivalent payload:

1. Core derives the same `order_id`.
2. Core checks for the existing order.
3. If the existing order is equivalent, Core returns the canonical existing order.
4. Core does not create another CMS order.
5. The client receives the original `order_id` and successful result.

For the same key with materially different order data, Core rejects the request with an idempotency conflict.

### Normalization rule

Persistence can represent some values differently from the API payload. In particular, Google Sheets can return `contact_preferences` as a comma-separated string while the client sends an array.

Idempotency comparison must normalize these equivalent representations before comparison.

---

## 6. Concurrency / Race Protection

A simple `find -> create` sequence is not sufficient because two concurrent requests can both observe that an order does not exist.

Core therefore treats persistence races as recoverable idempotent outcomes:

- the first successful persistence creates the canonical order;
- a losing concurrent request re-reads the deterministic `order_id`;
- if the persisted order is equivalent, the loser returns that canonical order instead of creating a duplicate.

This guarantees one persisted order for concurrent equivalent requests.

---

## 7. CMS Authentication

Core → CMS requests use an HMAC-SHA256 envelope.

The signing contract is versioned and uses explicit UTF-8 byte encoding for the secret and signing message.

The secret is held by server-side infrastructure and is never exposed to the browser.

Diagnostics may record safe fingerprints and request identifiers, but must not log secrets or raw sensitive payloads.

---

## 8. Order Lifecycle

The canonical order is created by Core with server-owned fields including:

- `order_id`
- creation timestamp
- trusted provider identity
- canonical items
- authoritative prices
- calculated subtotal/total
- validated order/customer data

The App clears the cart only after Core reports successful order creation.

The idempotency key for a successful checkout attempt is reset after success so the next checkout can create a new order.

---

## 9. Production Validation

The architecture was validated end-to-end on **2026-09-07**.

Validated path:

```text
Vintage App
  -> Render-hosted PREVIA Core
  -> PREVIA CMS (Google Apps Script)
  -> Google Sheets
```

### Initial order creation

A real checkout successfully created an order and corresponding order-item record in Google Sheets.

### Idempotency replay

The same checkout idempotency key was deliberately replayed after the order already existed.

Observed result:

- UI: order accepted successfully;
- Core HTTP result: `success: true`;
- returned `order_id`: `ORD-97fa698d-fd55-4de1-90a3-29a5a00a70d5`;
- returned creation timestamp matched the original order;
- Core log: `ORDER.FIND` returned `has_order: true`;
- no `ORDER.CREATE` occurred for the replay;
- no new rows appeared in Orders or OrderItems.

This is the required production behavior for an idempotent replay.

---

## 10. Automated Verification

The complete Core order test suite passed after the final idempotency normalization fix:

- Telegram identity verification
- HTTP order endpoint
- canonical order runtime
- product authority
- idempotency
- concurrent order idempotency

The concurrency test verifies that concurrent equivalent requests produce exactly one persisted order.

---

## 11. Production Gate

`feature/order-integration` must not be merged into `main` unless all of the following remain true:

- automated order tests are green;
- Telegram identity tests are green;
- product authority tests are green;
- idempotency tests are green;
- concurrency tests are green;
- a real production order can be created;
- a replay of the same idempotency key returns the original order;
- the replay creates no duplicate persistence records.

After merge, future changes to this architecture should be introduced as small, independently testable milestones.

---

## 12. Non-Negotiable Rules

1. Client data is untrusted.
2. Core owns business logic.
3. Core owns canonical order construction.
4. Product price and availability are authoritative outside the browser.
5. Telegram identity is verified by Core.
6. CMS persists; it does not define business rules.
7. Google Sheets stores data; it does not become the business-logic layer.
8. Repeated requests must be idempotent.
9. Concurrent equivalent requests must not create duplicates.
10. Secrets never enter client code or client-visible responses.
11. Cart state changes only after successful order creation.
12. Architecture changes require tests and a production gate.
