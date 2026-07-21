import type {
  BaleApiResponse,
  BaleChatId,
  BaleChatMember,
  BaleInlineKeyboardMarkup,
  BaleMessage,
  BaleWebhookInfo,
} from "./types";

export class BaleApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly errorCode?: number,
    public readonly retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "BaleApiError";
  }
}

export interface BaleClientOptions {
  token?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export class BaleClient {
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: BaleClientOptions = {}) {
    this.token = options.token ?? process.env.BALE_BOT_TOKEN ?? "";
    if (!this.token) throw new Error("BALE_BOT_TOKEN is not configured");
    this.baseUrl = (options.baseUrl ?? process.env.BALE_API_BASE_URL ?? "https://tapi.bale.ai").replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs ?? Number(process.env.BALE_REQUEST_TIMEOUT_MS ?? 8000);
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async call<T>(method: string, body: Record<string, unknown>): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(`${this.baseUrl}/bot${this.token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
        cache: "no-store",
      });

      const payload = (await response.json().catch(() => null)) as BaleApiResponse<T> | null;
      if (!response.ok || !payload?.ok || payload.result === undefined) {
        throw new BaleApiError(
          payload?.description ?? `Bale API request failed: ${method}`,
          response.status,
          payload?.error_code,
          payload?.parameters?.retry_after
        );
      }
      return payload.result;
    } catch (error) {
      if (error instanceof BaleApiError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new BaleApiError(`Bale API timeout: ${method}`);
      }
      throw new BaleApiError(error instanceof Error ? error.message : `Bale API error: ${method}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  sendMessage(input: {
    chatId: BaleChatId;
    text: string;
    replyMarkup?: BaleInlineKeyboardMarkup;
    replyToMessageId?: number;
  }): Promise<BaleMessage> {
    return this.call<BaleMessage>("sendMessage", {
      chat_id: input.chatId,
      text: input.text,
      ...(input.replyMarkup ? { reply_markup: input.replyMarkup } : {}),
      ...(input.replyToMessageId ? { reply_to_message_id: input.replyToMessageId } : {}),
    });
  }

  editMessageText(input: {
    chatId: BaleChatId;
    messageId: number;
    text: string;
    replyMarkup?: BaleInlineKeyboardMarkup;
  }): Promise<BaleMessage | true> {
    return this.call<BaleMessage | true>("editMessageText", {
      chat_id: input.chatId,
      message_id: input.messageId,
      text: input.text,
      ...(input.replyMarkup ? { reply_markup: input.replyMarkup } : {}),
    });
  }

  editMessageReplyMarkup(input: {
    chatId: BaleChatId;
    messageId: number;
    replyMarkup?: BaleInlineKeyboardMarkup;
  }): Promise<BaleMessage | true> {
    return this.call<BaleMessage | true>("editMessageReplyMarkup", {
      chat_id: input.chatId,
      message_id: input.messageId,
      ...(input.replyMarkup ? { reply_markup: input.replyMarkup } : {}),
    });
  }

  answerCallbackQuery(input: {
    callbackQueryId: string;
    text?: string;
    showAlert?: boolean;
  }): Promise<true> {
    return this.call<true>("answerCallbackQuery", {
      callback_query_id: input.callbackQueryId,
      ...(input.text !== undefined ? { text: input.text.slice(0, 200) } : {}),
      ...(input.showAlert !== undefined ? { show_alert: input.showAlert } : {}),
    });
  }

  getChatMember(chatId: BaleChatId, userId: string | number): Promise<BaleChatMember> {
    return this.call<BaleChatMember>("getChatMember", {
      chat_id: chatId,
      user_id: userId,
    });
  }

  setWebhook(url: string): Promise<true> {
    return this.call<true>("setWebhook", { url });
  }

  deleteWebhook(): Promise<true> {
    return this.call<true>("deleteWebhook", { url: "" });
  }

  getWebhookInfo(): Promise<BaleWebhookInfo> {
    return this.call<BaleWebhookInfo>("getWebhookInfo", {});
  }
}

let singleton: BaleClient | null = null;
export function getBaleClient(): BaleClient {
  singleton ??= new BaleClient();
  return singleton;
}
