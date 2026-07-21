# PREVIA Core — Definition of Done

This document defines the minimum completion criteria for every module in PREVIA Core.

A module is considered complete only when all items below are satisfied.

---

## 1. Implementation

- Functionality is fully implemented.
- Code follows the project architecture.
- No duplicated logic.
- One module = one responsibility.

---

## 2. Documentation

- JSDoc is complete.
- Public API is understandable.
- Naming is consistent.

---

## 3. Testing

- Manual tests exist.
- All manual tests pass.
- Edge cases are covered.
- Invalid input is verified.

---

## 4. Integration

- Module is exported.
- Public index.js is updated if required.
- Example usage exists (when applicable).

---

## 5. API Stability

- Public API remains backward compatible.
- Existing examples continue to work.
- Existing tests continue to pass.

---

## 6. Code Quality

- No dead code.
- No commented-out code.
- No unused exports.
- No unused imports.

---

## 7. Project Status

Before committing:

- npm run test:manual passes.
- Example project runs correctly.
- No temporary debug code remains.
- No TODOs related to this module.

---

## 8. Git

Before merge or milestone commit:

- git status is clean.
- Commit message is meaningful.
- Documentation is updated if behavior changed.

---

## Completion Rule

A module is finished only when implementation, documentation,
testing, integration and repository state satisfy all requirements.