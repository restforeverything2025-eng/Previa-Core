/**
 * ============================================================
 * PREVIA Core
 * Telegram Identity Verifier
 * ============================================================
 *
 * Verifies Telegram Mini App initData on the server side and
 * returns a trusted identity snapshot for order processing.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_MAX_AGE_SECONDS = 24 * 60 * 60;
const TELEGRAM_HASH_LENGTH = 64;

function authenticationError(message) {
    const error = new Error(message);
    error.code = "AUTHENTICATION_ERROR";
    error.retryable = false;
    return error;
}

function createTelegramSecretKey(botToken) {
    return createHmac("sha256", "WebAppData")
        .update(botToken)
        .digest();
}

function createDataCheckString(params) {
    return [...params.entries()]
        .filter(([key]) => key !== "hash")
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");
}

function safeHashEqual(receivedHash, expectedHash) {
    if (
        typeof receivedHash !== "string" ||
        typeof expectedHash !== "string" ||
        receivedHash.length !== TELEGRAM_HASH_LENGTH ||
        expectedHash.length !== TELEGRAM_HASH_LENGTH ||
        !/^[0-9a-fA-F]+$/.test(receivedHash) ||
        !/^[0-9a-fA-F]+$/.test(expectedHash)
    ) {
        return false;
    }

    return timingSafeEqual(
        Buffer.from(receivedHash, "hex"),
        Buffer.from(expectedHash, "hex")
    );
}

class TelegramIdentityVerifier {
    constructor(botToken, maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS) {
        if (typeof botToken !== "string" || !botToken.trim()) {
            throw new Error("Telegram bot token is required.");
        }

        if (!Number.isInteger(maxAgeSeconds) || maxAgeSeconds <= 0) {
            throw new Error("Telegram initData max age must be a positive integer.");
        }

        this.botToken = botToken;
        this.maxAgeSeconds = maxAgeSeconds;
    }

    verify(initData, nowSeconds = Math.floor(Date.now() / 1000)) {
        if (typeof initData !== "string" || !initData.trim()) {
            throw authenticationError("Telegram initData is required.");
        }

        let params;
        try {
            params = new URLSearchParams(initData);
        } catch {
            throw authenticationError("Telegram initData is invalid.");
        }

        const receivedHash = params.get("hash");
        const authDateRaw = params.get("auth_date");
        const userRaw = params.get("user");

        if (!receivedHash || !authDateRaw || !userRaw) {
            throw authenticationError("Telegram initData is missing required fields.");
        }

        const authDate = Number(authDateRaw);
        if (!Number.isInteger(authDate)) {
            throw authenticationError("Telegram auth_date is invalid.");
        }

        const age = nowSeconds - authDate;
        if (age < 0 || age > this.maxAgeSeconds) {
            throw authenticationError("Telegram initData has expired or is not yet valid.");
        }

        const dataCheckString = createDataCheckString(params);
        const secretKey = createTelegramSecretKey(this.botToken);
        const expectedHash = createHmac("sha256", secretKey)
            .update(dataCheckString)
            .digest("hex");

        if (!safeHashEqual(receivedHash, expectedHash)) {
            throw authenticationError("Telegram initData signature is invalid.");
        }

        let user;
        try {
            user = JSON.parse(userRaw);
        } catch {
            throw authenticationError("Telegram user data is invalid.");
        }

        if (!user || user.id === undefined || user.id === null) {
            throw authenticationError("Telegram user id is missing.");
        }

        const telegramName = [user.first_name, user.last_name]
            .filter(Boolean)
            .join(" ")
            .trim();

        return {
            provider: "telegram",
            providerId: String(user.id),
            telegram_username: user.username ? String(user.username) : "",
            telegram_name: telegramName || String(user.id)
        };
    }
}

export {
    TelegramIdentityVerifier,
    DEFAULT_MAX_AGE_SECONDS
};
