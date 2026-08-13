# 12. CODING_STANDARD

Version: 1.0

# Purpose

This document defines the coding standards for every PREVIA repository.

------------------------------------------------------------------------

# General Rules

-   Readability over cleverness.
-   Consistency over personal preference.
-   Simplicity over abstraction.

------------------------------------------------------------------------

# Naming

Variables: - camelCase

Functions: - camelCase using verbs

Classes: - PascalCase

Constants: - UPPER_SNAKE_CASE

Files: - kebab-case or existing project convention.

------------------------------------------------------------------------

# Functions

-   One responsibility.
-   Short and predictable.
-   Avoid hidden side effects.
-   Return explicit values.

------------------------------------------------------------------------

# Modules

Every module should answer one question:

"What is my responsibility?"

If there is more than one answer, split the module.

------------------------------------------------------------------------

# Comments

Write comments only when code cannot explain itself.

Never describe obvious code.

Explain *why*, not *what*.

------------------------------------------------------------------------

# Error Handling

Never ignore exceptions.

Provide meaningful messages.

------------------------------------------------------------------------

# Formatting

-   Consistent indentation.
-   Blank lines between logical blocks.
-   No trailing dead code.
-   Remove unused imports and variables.

------------------------------------------------------------------------

# Dependencies

Add a dependency only when it provides clear long-term value.

Avoid unnecessary libraries.

------------------------------------------------------------------------

# Testing

Every new feature must be tested before publishing.

Regression bugs require regression tests.

------------------------------------------------------------------------

# Git

-   Small commits.
-   Clear commit messages.
-   One logical change per commit.

------------------------------------------------------------------------

# Final Rule

Code is written for the next developer, not for the current one.
