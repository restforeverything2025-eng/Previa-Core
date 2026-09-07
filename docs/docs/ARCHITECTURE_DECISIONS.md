ADR-001

Google Sheets is the Single Source of Truth.

Status:
Accepted

ADR-002

Business logic belongs to Core.

Status:
Accepted

ADR-003

Infrastructure belongs to applications.

Status:
Accepted

ADR-004

Authentication belongs to applications.

Customer belongs to Core.

Status:
Accepted

ADR-005

CMS never owns business logic.

Status:
Accepted

ADR-006

PREVIA evolves through small independent milestones.

Status:
Accepted

ADR-007

Order processing uses the validated App → Core → Telegram Identity → CMS → Google Sheets architecture.

Status:
Accepted

The browser is untrusted. Core is the trust boundary for Telegram identity, product authority, canonical order construction, pricing, totals, idempotency, concurrency protection, and Core → CMS authentication.

Repeated equivalent requests must return the existing canonical order without creating duplicate persistence records. Concurrent equivalent requests must converge on one persisted order.

Reference:
`docs/docs/ORDER_INTEGRATION_ARCHITECTURE.md`
