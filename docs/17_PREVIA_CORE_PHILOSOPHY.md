# 17. PREVIA CORE PHILOSOPHY

Version: 1.0.0

---

# Why PREVIA Core Exists

PREVIA Core is the foundation of the PREVIA ecosystem.

Its purpose is to provide a small, predictable and reusable library that contains the business logic shared across multiple applications.

The library is designed to be independent of any specific platform.

Current and future consumers include:

- PREVIA Boutique
- PREVIA CMS
- Telegram Bot
- Future applications

PREVIA Core is not an application.

It is the common language used by every application.

---

# Design Principles

PREVIA Core follows several fundamental principles.

## Single Responsibility

Every module has one clear responsibility.

A module should do one thing and do it well.

---

## Simplicity

Simple solutions are preferred over clever ones.

Readable code is more valuable than shorter code.

---

## Explicitness

Behavior should be obvious.

Hidden side effects should be avoided.

---

## Small Public API

Only stable functionality becomes part of the public API.

Everything else remains internal.

---

# Domain Philosophy

Domain models represent business concepts.

A domain object describes data.

A domain object does not perform infrastructure tasks.

Domain models:

- Product
- Brand
- Category

A domain model never knows about:

- Google Sheets
- Google Drive
- GitHub
- Telegram
- HTTP
- Filesystem

Its only responsibility is representing business data.

---

# Service Philosophy

Services perform work.

Examples include:

- validation
- publishing
- searching
- synchronization
- image processing

Services coordinate domain objects.

Services may communicate with external systems.

Business processes belong to services, not to domain models.

---

# Data Philosophy

PREVIA Core follows the Single Source of Truth principle.

Every piece of information should have one authoritative owner.

The system avoids storing information that can be calculated.

Derived values should be computed when needed.

Duplicate data should be avoided.

---

# Architecture Rules

Architecture decisions are based on responsibility.

A new class is introduced only when it has a clear purpose.

Future possibilities alone are not sufficient justification.

The project grows from real requirements rather than hypothetical ones.

---

# Development Workflow

Development follows a predictable workflow.

1. Understand the problem.
2. Design the architecture.
3. Implement the solution.
4. Test the behavior.
5. Update documentation.
6. Commit the changes.

Small incremental improvements are preferred over large rewrites.

---

# Testing Philosophy

Every public module should be testable.

Behavior is more important than implementation details.

Manual tests are acceptable during early development.

Automated testing should gradually replace manual testing as the project evolves.

---

# Future Evolution

PREVIA Core is expected to grow carefully.

New modules should appear only after a real responsibility has been identified.

Possible future services include:

- Image Processing Service
- Search Service
- Cache Service
- Publication Service

These services will only be introduced when they solve real problems.

---

# Final Principle

PREVIA Core grows by solving real problems, not by predicting imaginary ones.