# 04. DOMAIN

Version: 1.0

# Purpose

This document defines the business domain of PREVIA.

------------------------------------------------------------------------

# Overview

PREVIA is a platform for managing and selling curated vintage products.

The domain is independent of any client application.

------------------------------------------------------------------------

# Primary Entities

## Product

Represents a physical item.

Attributes include:

-   ID
-   SKU
-   Category
-   Brand
-   Name
-   Description
-   Price
-   Currency
-   Status
-   Images

------------------------------------------------------------------------

## Category

Groups products.

Examples:

-   Watches
-   Jewelry
-   Skarb
-   Sale

------------------------------------------------------------------------

## Brand

Manufacturer or designer.

Examples:

-   Omega
-   Rado
-   Chanel

------------------------------------------------------------------------

## Media

Images belonging to a product.

Stored in Google Drive.

Referenced by SKU.

------------------------------------------------------------------------

## Customer

Represents a buyer.

Future entity.

------------------------------------------------------------------------

## Favorite

Connection between customer and product.

------------------------------------------------------------------------

## Cart

Temporary collection of products.

------------------------------------------------------------------------

## Order

Completed purchase.

Future module.

------------------------------------------------------------------------

# Relationships

Category

↓

Product

↓

Media

↓

Customer

↓

Favorite / Cart / Order

------------------------------------------------------------------------

# Domain Rules

-   SKU is unique.
-   Product owns its media.
-   Images never exist without a product.
-   Categories classify products.
-   Orders contain products only.
-   Business rules belong to Core.

------------------------------------------------------------------------

# Future Domain

Additional entities may include:

-   Reviews
-   Collections
-   Coupons
-   Shipping
-   Payments
-   Inventory
-   Notifications
-   Analytics

------------------------------------------------------------------------

# Final Rule

Every new feature must extend the domain instead of bypassing it.
