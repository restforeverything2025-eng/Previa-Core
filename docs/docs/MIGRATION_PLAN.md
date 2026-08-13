# PREVIA Core Migration Plan

## Purpose

This document describes the gradual migration of shared business logic into PREVIA Core.

Migration follows the PREVIA philosophy:

- Architecture before implementation.
- Small incremental changes.
- One responsibility per module.
- No duplication between applications.

---

## Migration Status

| Module           | Source | Target | Status   |
|------------------|--------|--------|----------|
| Product Status   | CMS    | Core   | Complete |
| Currency         | CMS    | Core   | Complete |
| Categories       | CMS    | Core   | Complete |
| Product Model    | CMS    | Core   | Future   |
| Validation Rules | CMS    | Core   | Future   |
| Search Logic     | CMS    | Core   | Future   |
| Timeline Logic   | CMS    | Core   | Future   |

---

## Migration Rules

A module may be moved into PREVIA Core only if:

- it contains business logic;
- it is platform independent;
- it can be reused by multiple PREVIA applications;
- it has no infrastructure dependencies.

---

## Current Priority

1. Product Status
2. Currency
3. Categories

Only after these modules become stable should more complex business logic be migrated.