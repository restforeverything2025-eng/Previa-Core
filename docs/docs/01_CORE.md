# PREVIA CORE

**Version:** 1.0 Foundation Draft\
**Status:** Draft

------------------------------------------------------------------------

# Preface

PREVIA Core is the architectural heart of the PREVIA ecosystem.

It defines business rules shared by every PREVIA application.

------------------------------------------------------------------------

# 1. Mission

Create a unified business platform with one source of truth for business
logic.

# 2. Vision

PREVIA is an ecosystem composed of independent clients sharing one Core.

Clients: - Website - CMS - Telegram - Mobile - Future API

# 3. Philosophy

-   One Platform
-   One Logic
-   One Domain
-   One Truth

Data belongs to Google Sheets. Business rules belong to PREVIA Core.

# 4. Principles

1.  Single Responsibility
2.  Separation of Concerns
3.  Documentation First
4.  Architecture Before Implementation
5.  Simplicity
6.  Predictability

# 5. Core Responsibilities

-   Products
-   Categories
-   Customers
-   Orders
-   Favorites
-   Cart
-   Validation
-   Notifications
-   Search
-   Pricing

# 6. Client Responsibilities

Website --- presentation.

CMS --- administration.

Telegram --- conversational interaction.

Mobile --- native experience.

# 7. Single Source of Truth

Data → Google Sheets

Media → Google Drive

Business Logic → PREVIA Core

Presentation → Client applications

# 8. Architecture Layers

Data

Domain

Services

Interfaces

Clients

# 9. Domain

Entities:

-   Product
-   Category
-   Brand
-   Customer
-   Order
-   Favorite
-   Cart
-   Media
-   Notification

# 10. Services

-   Product
-   Search
-   Catalog
-   Favorite
-   Cart
-   Order
-   Validation
-   Media
-   Notification

# 11. Communication

Clients communicate through Core.

No client owns business logic.

# 12. Evolution

Extend.

Never duplicate.

Never fork business rules.

# 13. Coding Philosophy

Readable.

Modular.

Documented.

Predictable.

# 14. Documentation

Every architectural decision must be documented before implementation.

# 15. Roadmap

Foundation

Domain

Services

SDK

Integrations

Automation

Public API

Mobile

------------------------------------------------------------------------

## Constitutional Rules

1.  PREVIA is one platform.
2.  PREVIA Core owns business logic.
3.  Clients never duplicate business logic.
4.  Architecture precedes implementation.
5.  Documentation precedes coding.
6.  Simplicity beats complexity.
