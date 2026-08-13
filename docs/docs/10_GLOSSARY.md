# 10. GLOSSARY

Version: 1.0

# Purpose

This document defines the common terminology used throughout the PREVIA
ecosystem.

Every contributor should use these terms consistently.

------------------------------------------------------------------------

# Core

The central business layer responsible for domain logic and services.

------------------------------------------------------------------------

# Client

Any application that consumes PREVIA Core.

Examples:

-   Website
-   CMS
-   Telegram
-   Mobile App

------------------------------------------------------------------------

# Domain

The business model describing products, customers, media, orders and
their relationships.

------------------------------------------------------------------------

# Service

A reusable business component with one responsibility.

Example:

Product Service

------------------------------------------------------------------------

# Entity

A business object.

Examples:

-   Product
-   Category
-   Media
-   Customer
-   Order

------------------------------------------------------------------------

# Product

A physical item available in PREVIA.

Identified by SKU.

------------------------------------------------------------------------

# SKU

Stock Keeping Unit.

Unique product identifier.

Never changes.

------------------------------------------------------------------------

# Category

Logical grouping of products.

------------------------------------------------------------------------

# Media

Images belonging to a product.

Stored in Google Drive.

------------------------------------------------------------------------

# Repository

A Git repository representing one application or component.

Examples:

-   Previa-Core
-   Previa-CMS
-   Previa-Vintage-App

------------------------------------------------------------------------

# Publish

The process of exporting validated data into production.

------------------------------------------------------------------------

# Validation

Automatic verification of data integrity before publishing.

------------------------------------------------------------------------

# Client Application

A user-facing interface consuming PREVIA Core.

------------------------------------------------------------------------

# Single Source of Truth

Every business object has exactly one owner.

No duplicated authoritative data.

------------------------------------------------------------------------

# Business Logic

Rules describing how the system behaves.

Lives only inside PREVIA Core.

------------------------------------------------------------------------

# Architecture

The organization of applications, services and responsibilities.

------------------------------------------------------------------------

# Contract

A stable interface between services or applications.

------------------------------------------------------------------------

# Version

A numbered release of software or documentation.

Uses Semantic Versioning.

------------------------------------------------------------------------

# Documentation

The official specification describing the PREVIA ecosystem.

Documentation is considered part of the product.

------------------------------------------------------------------------

# Final Rule

If a new term appears more than once in the project, it should be
defined here.
