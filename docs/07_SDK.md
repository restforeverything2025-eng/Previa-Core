# 07. SDK

Version: 1.0

# Purpose

This document defines the development standards for applications using
PREVIA Core.

------------------------------------------------------------------------

# Goals

The SDK provides:

-   Stable interfaces
-   Predictable behavior
-   Reusable services
-   Shared data models
-   Consistent integrations

------------------------------------------------------------------------

# Design Principles

-   API First
-   Backward Compatibility
-   Explicit Contracts
-   Minimal Dependencies
-   Stable Naming

------------------------------------------------------------------------

# Core Objects

## Product

Represents a product.

## Category

Represents a product category.

## Media

Represents product images.

## Customer

Future entity.

## Order

Future entity.

------------------------------------------------------------------------

# Service Access

Applications should communicate through services.

Example:

-   Product Service
-   Search Service
-   Favorites Service
-   Publish Service
-   Validation Service

Never access storage directly.

------------------------------------------------------------------------

# Events

Typical events:

-   ProductCreated
-   ProductUpdated
-   ProductPublished
-   FavoriteAdded
-   FavoriteRemoved
-   OrderCreated
-   OrderCompleted

------------------------------------------------------------------------

# Versioning

Rules:

-   Breaking changes require a major version.
-   New features increase the minor version.
-   Fixes increase the patch version.

Semantic Versioning:

MAJOR.MINOR.PATCH

------------------------------------------------------------------------

# Error Handling

Every operation returns:

-   Success state
-   Error code
-   Human-readable message

Errors must never be silent.

------------------------------------------------------------------------

# Extension Rules

Extensions must:

-   Follow SDK contracts
-   Avoid modifying Core behavior
-   Remain independent
-   Be removable without side effects

------------------------------------------------------------------------

# Future SDK

Planned additions:

-   REST API
-   Webhooks
-   Plugin System
-   Authentication
-   Public Developer Guide

------------------------------------------------------------------------

# Final Rule

Applications integrate with PREVIA through stable interfaces, never
through internal implementation details.
