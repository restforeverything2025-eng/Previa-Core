# 02. PRINCIPLES

Version: 1.0

## Purpose

This document defines the engineering principles of the PREVIA
ecosystem. Every repository, service and future feature must comply with
these rules.

------------------------------------------------------------------------

# 1. Single Responsibility

Every module has one responsibility.

# 2. Single Source of Truth

Data has exactly one owner. - Products → Google Sheets - Images → Google
Drive - Business Logic → PREVIA Core

# 3. Business Logic Lives in Core

Clients never implement business rules.

# 4. Thin Clients

Clients render UI only.

# 5. Readability First

Code is written for humans.

# 6. Small Functions

Functions perform one task.

# 7. Predictability

Avoid hidden side effects.

# 8. Validation Before Action

Validate first, execute second.

# 9. Fail Clearly

Errors explain what failed and how to fix it.

# 10. Documentation Before Complexity

Architecture is documented before implementation.

# 11. Backward Compatibility

Avoid breaking existing clients.

# 12. Explicit Naming

Names describe responsibility.

# 13. One Module = One Responsibility

Split modules before they become difficult to maintain.

# 14. Configuration over Hardcoding

Avoid magic values.

# 15. Consistency

Naming, structure and style remain uniform.

# 16. Testing

Every completed feature is tested.

# 17. Commit Discipline

One logical change per commit.

# 18. Simplicity Wins

Prefer the simplest correct solution.

# 19. Performance After Correctness

Correctness first. Optimization later.

# 20. Long-Term Thinking

Design for years, not days.

## Final Rule

Documentation is part of the product.
