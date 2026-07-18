# 08. DATA_MODEL

Version: 1.0

# Purpose

This document defines the canonical data model used across the PREVIA
ecosystem.

------------------------------------------------------------------------

# Principles

-   One domain model for all clients.
-   One owner for every piece of data.
-   Stable identifiers.
-   No duplicated business data.

------------------------------------------------------------------------

# Product

Fields:

-   id
-   sku
-   category
-   brand
-   name
-   description
-   price
-   currency
-   status
-   featured
-   dateAdded
-   sortOrder
-   notes

Relationships:

-   belongs to one Category
-   owns many Media

------------------------------------------------------------------------

# Category

Fields:

-   id
-   name
-   slug
-   description
-   sortOrder

Relationship:

-   contains many Products

------------------------------------------------------------------------

# Media

Fields:

-   id
-   productSku
-   filename
-   url
-   order

Relationship:

-   belongs to one Product

------------------------------------------------------------------------

# Customer (Future)

Fields:

-   id
-   name
-   email
-   phone
-   preferences

------------------------------------------------------------------------

# Favorite

Fields:

-   customerId
-   productId
-   createdAt

------------------------------------------------------------------------

# Cart

Fields:

-   customerId
-   items
-   totalPrice

------------------------------------------------------------------------

# Order (Future)

Fields:

-   id
-   customerId
-   products
-   subtotal
-   shipping
-   total
-   paymentStatus
-   orderStatus
-   createdAt

------------------------------------------------------------------------

# Identifiers

Rules:

-   Every entity has a unique ID.
-   SKU uniquely identifies a product.
-   IDs never change.

------------------------------------------------------------------------

# Relationships

Category ↓ Product ↓ Media

Customer ↓ Favorite ↓ Cart ↓ Order

------------------------------------------------------------------------

# Validation Rules

-   SKU must be unique.
-   Required fields cannot be empty.
-   References must exist.
-   Prices must be valid.
-   Media must belong to a product.

------------------------------------------------------------------------

# Future Extensions

-   Inventory
-   Supplier
-   Collection
-   Coupon
-   Shipment
-   Payment
-   Review

------------------------------------------------------------------------

# Final Rule

Every PREVIA application must use this shared data model without
redefining business entities.
