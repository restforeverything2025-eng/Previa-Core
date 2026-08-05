# PREVIA Identity Provider

## Purpose

Identity Providers connect external identities with PREVIA Customers.

Identity Providers authenticate people.

They do not define Customers.

The Customer contract always belongs to PREVIA Core.

---

# Current Provider

Telegram

Telegram is currently the primary identity provider.

Authentication is performed through Telegram.

A successful authentication returns a Telegram identity.

PREVIA then finds or creates a Customer.

---

# Authentication Flow

Telegram User

↓

Telegram Authentication

↓

Telegram Identity

↓

Find Customer

↓

Create Customer if necessary

↓

Return Customer

---

# Responsibilities

Identity Provider is responsible for:

- authentication
- identity verification
- external user identifier

Identity Provider is NOT responsible for:

- favorites
- orders
- notifications
- customer preferences
- business logic

---

# Provider Contract

Every Identity Provider must provide:

externalId

displayName

username

languageCode

provider

---

# Current Providers

Telegram

---

# Future Providers

Google

Apple

Email

Local PREVIA Account

---

# Rules

Changing the Identity Provider must never require changing the Customer contract.

Business logic never depends on the authentication provider.

Identity Providers may change.

Customer remains the same.