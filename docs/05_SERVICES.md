# 05. SERVICES

Version: 1.0

# Purpose

This document describes every service inside the PREVIA ecosystem and
the responsibility of each service.

------------------------------------------------------------------------

# Service Philosophy

Each service has exactly one responsibility.

Services communicate through clearly defined interfaces.

A service never owns data that belongs to another service.

------------------------------------------------------------------------

# Product Service

Responsible for:

-   Product loading
-   Product lookup
-   Product validation
-   Product availability
-   Product metadata

Input: - Google Sheets

Output: - Product objects

------------------------------------------------------------------------

# Media Service

Responsible for:

-   Image mapping
-   Gallery creation
-   Thumbnail generation (future)
-   Image validation

Input: - Google Drive

Output: - Media collection

------------------------------------------------------------------------

# Search Service

Responsible for:

-   Search indexing
-   Suggestions
-   Filtering
-   Sorting
-   Search relevance

Input: - Product collection

Output: - Matching products

------------------------------------------------------------------------

# Category Service

Responsible for:

-   Category tree
-   Category counters
-   Featured categories
-   Navigation support

------------------------------------------------------------------------

# Favorites Service

Responsible for:

-   Add favorite
-   Remove favorite
-   Favorite synchronization
-   Favorite persistence

------------------------------------------------------------------------

# Cart Service

Responsible for:

-   Cart state
-   Quantity
-   Price calculation
-   Cart validation

Future module.

------------------------------------------------------------------------

# Order Service

Responsible for:

-   Order creation
-   Order validation
-   Order lifecycle
-   Status changes

Future module.

------------------------------------------------------------------------

# Customer Service

Responsible for:

-   Customer profile
-   Addresses
-   Preferences
-   History

Future module.

------------------------------------------------------------------------

# Notification Service

Responsible for:

-   Telegram messages
-   Email
-   Push notifications
-   System alerts

Future module.

------------------------------------------------------------------------

# Publish Service

Responsible for:

-   Data export
-   Build generation
-   GitHub publishing
-   Deployment preparation

------------------------------------------------------------------------

# Validation Service

Responsible for:

-   Data integrity
-   SKU uniqueness
-   Missing fields
-   Broken references
-   Invalid media

Runs before publishing.

------------------------------------------------------------------------

# Service Rules

-   One service = one responsibility.
-   Services never bypass Core.
-   Services are reusable.
-   Services are independent.
-   Services communicate through contracts.

------------------------------------------------------------------------

# Future Services

-   Analytics
-   Inventory
-   Pricing
-   Payments
-   Shipping
-   CRM
-   AI Assistant

------------------------------------------------------------------------

# Final Rule

A service exists to encapsulate one business capability and make it
reusable across every PREVIA client.
