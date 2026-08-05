# Repository Pattern

## Purpose

Repositories provide access to data.

Repositories are infrastructure.

Repositories never contain business logic.

Business logic belongs to Services.

Services never know where data is stored.

Applications choose which Repository implementation to use.

Examples:

BrowserFavoritesRepository

TelegramFavoritesRepository

CloudFavoritesRepository