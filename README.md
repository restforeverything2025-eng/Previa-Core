# PREVIA Core

Lightweight JavaScript core library for PREVIA ecosystem.

## Philosophy

PREVIA Core follows a simple architecture:

- One Module = One Responsibility
- Pure JavaScript (ES Modules)
- No external dependencies
- Predictable behavior
- Small composable utilities

## Project Structure

```text
src/        Library source code
examples/   Usage examples
tests/      Manual and automated tests
```

## Telegram authentication

The web application may authenticate users through Telegram's current Login/OIDC flow. The browser receives an OIDC `id_token` from Telegram's Login library; Core verifies the JWT signature against Telegram's JWKS and validates `iss`, `aud`, `exp`, and an optional `nonce` before creating the trusted PREVIA Telegram identity.

The legacy Mini App `telegram_init_data` verifier remains available, and the legacy Login Widget verifier remains available during migration.

For the HTTP runtime, configure:

```text
PREVIA_TELEGRAM_BOT_TOKEN=<bot token>
PREVIA_TELEGRAM_OIDC_CLIENT_ID=<BotFather Client ID>
```

`PREVIA_TELEGRAM_OIDC_CLIENT_ID` is the Client ID shown by BotFather under Login Widget. Do not expose the Client Secret in the browser or in PREVIA App.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the example:

```bash
npm run example
```

Run manual tests:

```bash
npm run test:manual
npm run test:telegram-oidc
npm run test:web
npm run test:orders
```

## Version

Current version: **0.1.0**
