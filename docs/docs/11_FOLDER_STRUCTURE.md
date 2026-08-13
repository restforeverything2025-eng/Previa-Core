# 11. FOLDER_STRUCTURE

Version: 1.0

# Purpose

This document defines the standard directory structure used across the
PREVIA ecosystem.

------------------------------------------------------------------------

# Ecosystem

    PREVIA/
    │
    ├── Previa-Core/
    ├── Previa-CMS/
    └── Previa-Vintage-App/

------------------------------------------------------------------------

# Previa-Core

    Previa-Core/
    │
    ├── .github/
    ├── assets/
    ├── docs/
    ├── examples/
    └── src/
        ├── domain/
        ├── services/
        ├── models/
        ├── validation/
        ├── publish/
        ├── utils/
        └── shared/

------------------------------------------------------------------------

# Previa-CMS

    Previa-CMS/
    │
    ├── Apps Script files
    ├── Validation
    ├── Publish
    ├── Drive
    ├── Sheets
    └── Services

------------------------------------------------------------------------

# Previa-Vintage-App

    Previa-Vintage-App/
    │
    ├── assets/
    ├── css/
    ├── js/
    │   ├── modules/
    │   └── services/
    ├── images/
    └── index.html

------------------------------------------------------------------------

# Documentation

All specifications are stored in:

    docs/

Naming convention:

    00_INDEX.md
    01_CORE.md
    02_PRINCIPLES.md
    03_ARCHITECTURE.md
    ...

------------------------------------------------------------------------

# Rules

-   One folder = one responsibility.
-   Avoid deep nesting.
-   Keep naming consistent.
-   Documentation lives in `docs/`.
-   Shared logic belongs in Core.

------------------------------------------------------------------------

# Final Rule

The folder structure should make the project understandable before
reading any source code.
