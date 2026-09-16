/**
 * ============================================================
 * PREVIA Core
 * Telegram Notification Service
 * ============================================================
 *
 * Sends administrative notifications about successfully
 * created orders through the Telegram Bot API.
 * ============================================================
 */

class TelegramNotificationService {
  constructor(
    botToken,
    adminChatId,
    transport = null,
    threadId = null
 ) {
    if (!botToken) {
      throw new Error("Telegram bot token is required");
    }

    if (!adminChatId) {
      throw new Error("Telegram admin chat ID is required");
    }

    this.botToken = botToken;
    this.adminChatId = adminChatId;
    this.threadId = threadId;
  this.transport = transport;
  }

  async sendNewOrderNotification(
    order,
    items = [],
    publicOrderNumber = null
  ) {
    const message = this._buildOrderMessage(
      order,
      items,
      publicOrderNumber
    );

    const payload = {
      chat_id: this.adminChatId,
      text: message
    };

    if (this.threadId) {
      payload.message_thread_id = Number(this.threadId);
    }

    const response = await this._sendMessage(payload);

    if (!response || response.ok !== true) {
      const error = new Error(
        response?.description || "Telegram notification failed"
      );

      error.code = "TELEGRAM_NOTIFICATION_ERROR";
      error.retryable = true;

      throw error;
    }

    return {
      success: true
    };
  }

  _buildOrderMessage(order, items, publicOrderNumber) {
    const orderNumber =
      publicOrderNumber ||
      order?.order_id ||
      "UNKNOWN";

    const customerName =
      order?.customer_name ||
      order?.telegram_name ||
      "Не вказано";

    const phone =
      order?.phone ||
      "Не вказано";

    const email =
      order?.email ||
      "Не вказано";

    const itemLines = items.map(item => {
      const title = item?.title || item?.sku || "Товар";
      const quantity = Number(item?.quantity) || 1;
      const price = Number(item?.price) || 0;
      const subtotal = Number(item?.subtotal) || price * quantity;

      return [
        `⌚ ${title}`,
        `   ${quantity} × ${this._formatAmount(price)} € = ${this._formatAmount(subtotal)} €`
      ].join("\n");
    });

    const total = Number(order?.total) || 0;

    return [
      "🛎 НОВЕ ЗАМОВЛЕННЯ",
      "",
      orderNumber,
      "",
      `👤 ${customerName}`,
      `📞 ${phone}`,
      `📧 ${email}`,
      "",
      ...itemLines,
      "",
      `💰 ВСЬОГО: ${this._formatAmount(total)} €`,
      "",
      "📦 ЗАБРОНЬОВАНО"
    ].join("\n");
  }

  _formatAmount(value) {
    return Number(value).toFixed(2);
  }

  async _sendMessage(payload) {
    if (this.transport) {
      return this.transport.sendMessage(payload);
    }

    const response = await fetch(
      `https://api.telegram.org/bot${this.botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      const error = new Error(
        `Telegram HTTP ${response.status}: ${response.statusText}`
      );

      error.code = "TELEGRAM_HTTP_ERROR";
      error.retryable = response.status >= 500;

      throw error;
    }

    return await response.json();
  }
}

export {
  TelegramNotificationService
};
