# 03. ARCHITECTURE

Version: 1.0

# Purpose

This document describes the high-level architecture of the PREVIA
ecosystem.

------------------------------------------------------------------------

# Core Philosophy

PREVIA consists of independent applications connected through a shared
domain.

                    +------------------+
                    |  Google Sheets   |
                    |   Product Data   |
                    +---------+--------+
                              |
                    +---------v--------+
                    |   PREVIA Core    |
                    | Business Logic   |
                    +--+-----+-----+---+
                       |     |     |
            +----------+     |     +-----------+
            |                |                 |
    +-------v------+ +-------v------+ +--------v-------+
    | Vintage App  | | Telegram Bot | | Future Mobile |
    | Website       | | Boutique     | | Application   |
    +---------------+ +--------------+ +--------------+

                    |
            +-------v--------+
            | Google Drive   |
            | Product Images |
            +----------------+

------------------------------------------------------------------------

# Layers

## Data Layer

Responsible for persistent storage.

Components:

-   Google Sheets
-   Google Drive

Rules:

-   Stores data only.
-   No business logic.

------------------------------------------------------------------------

## Core Layer

Responsible for all business rules.

Responsibilities:

-   Validation
-   Search
-   Favorites
-   Orders
-   Customers
-   Products
-   Pricing
-   Media mapping
-   Synchronization

The Core never renders UI.

------------------------------------------------------------------------

## Client Layer

Clients:

-   Website
-   Telegram Bot
-   Future Mobile App
-   Future Admin tools

Responsibilities:

-   Interface
-   Navigation
-   Rendering
-   User interaction

Clients never duplicate business logic.

------------------------------------------------------------------------

# Communication

Direction is always:

Storage → Core → Client

Clients never communicate directly with storage.

------------------------------------------------------------------------

# Single Source of Truth

  Resource         Owner
  ---------------- ---------------
  Products         Google Sheets
  Images           Google Drive
  Business Rules   PREVIA Core
  UI               Client

------------------------------------------------------------------------

# Scalability

New clients should connect to Core without changing existing
applications.

Examples:

-   Marketplace exporter
-   Instagram automation
-   CRM
-   Analytics
-   Desktop application

------------------------------------------------------------------------

# Architectural Goals

-   Maintainability
-   Predictability
-   Low coupling
-   High cohesion
-   Clear responsibilities
-   Independent evolution

------------------------------------------------------------------------

# Final Rule

Every architectural decision must reduce complexity instead of
increasing it.
