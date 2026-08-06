# Customer Contract

## Customer

Customer is the business representation of a person.

Customer never depends on Telegram or any other provider.

---

## Required Fields

- id
- displayName
- provider
- providerId

---

## Optional Fields

- username
- avatar
- language
- createdAt
- updatedAt

---

## Customer Capabilities

Customer can:

- own Favorites
- own Search Requests
- own Reservations

Customer never stores business logic.

---

## Architecture Rule

Applications authenticate.

Core identifies Customers.