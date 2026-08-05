# PREVIA Customer Contract

## Purpose

Customer represents a person known to the PREVIA ecosystem.

A Customer is independent of any authentication provider.

Telegram is currently the primary identity provider, but the model must remain platform independent.

---

# Identity

## Required

telegramId

## Optional

username

displayName

languageCode

---

# Lifecycle

firstSeen

lastSeen

status

---

# Customer Data

favorites

orders

notes

---

# Preferences

currency

locale

notifications

---

# Rules

- telegramId is immutable.
- Customer may exist without orders.
- Customer may exist without favorites.
- Favorites belong to Customer.
- Orders belong to Customer.
- Customer never stores Telegram API objects.
- Customer never stores UI state.
- Customer does not know where data is stored.
- Identity provider may change without changing the Customer model.

---

# Future

Possible future identity providers:

- Telegram
- Email
- Google
- Apple
- Local PREVIA Account

The Customer contract must remain unchanged regardless of the authentication method.