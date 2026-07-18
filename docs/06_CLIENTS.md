# 06. CLIENTS

Version: 1.0

# Purpose

This document defines every client application that can interact with
PREVIA Core.

------------------------------------------------------------------------

# Client Philosophy

A client is an interface.

It presents information to the user but does not own business logic.

All business rules belong to PREVIA Core.

------------------------------------------------------------------------

# Website Client

Repository:

-   Previa-Vintage-App

Responsibilities:

-   Catalog
-   Product page
-   Search
-   Favorites
-   Navigation
-   Responsive UI

Consumes:

-   Product data
-   Media
-   Search results

Never modifies business rules.

------------------------------------------------------------------------

# CMS Client

Repository:

-   Previa-CMS

Responsibilities:

-   Product editing
-   Validation
-   Publishing
-   Data management

Consumes:

-   Google Sheets
-   Google Drive
-   Publish Service

------------------------------------------------------------------------

# Telegram Client

Responsibilities:

-   Product browsing
-   Notifications
-   Orders (future)
-   Favorites (future)

Designed for fast interaction.

------------------------------------------------------------------------

# Mobile Client

Future application.

Responsibilities:

-   Native shopping experience
-   Offline cache
-   Push notifications
-   Camera integration

Uses the same Core services.

------------------------------------------------------------------------

# Admin Client

Future application.

Responsibilities:

-   Analytics
-   Reports
-   Moderation
-   Inventory
-   Customer management

------------------------------------------------------------------------

# External Clients

Future integrations:

-   Instagram
-   Facebook Marketplace
-   Etsy
-   eBay
-   CRM
-   ERP

Each integration communicates through PREVIA Core.

------------------------------------------------------------------------

# Client Rules

-   Clients never communicate directly with storage.
-   Clients never duplicate business logic.
-   Clients may have different interfaces.
-   Clients share one domain model.
-   Clients remain independent from each other.

------------------------------------------------------------------------

# Data Flow

Google Sheets ↓ PREVIA Core ↓ Client ↓ User

------------------------------------------------------------------------

# Final Rule

A new client should be possible without changing existing clients or the
Core architecture.
