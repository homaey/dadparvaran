import { BaleClient } from "@/modules/bale/client";

export interface BaleNotificationProvider {
  send(input: { chatId: string; title: string; message: string }): Promise<void>;
}

export class BaleBotApiProvider implements BaleNotificationProvider {
  private readonly client: BaleClient;

  constructor(token: string) {
    this.client = new BaleClient({ token });
  }

  async send(input: { chatId: string; title: string; message: string }): Promise<void> {
    await this.client.sendMessage({
      chatId: input.chatId,
      text: `${input.title}\n\n${input.message}`,
    });
  }
}

export function getBaleProvider(): BaleNotificationProvider | null {
  const token = process.env.BALE_BOT_TOKEN;
  return token ? new BaleBotApiProvider(token) : null;
}

/**
 * Operational alert to the fixed admin destination.
 * It intentionally never throws: a messenger outage must not fail the caller.
 */
export async function notifyAdminViaBale(title: string, message: string): Promise<boolean> {
  const chatId = process.env.BALE_ADMIN_CHAT_ID;
  const provider = getBaleProvider();
  if (!chatId || !provider) return false;

  try {
    await provider.send({ chatId, title, message });
    return true;
  } catch (error) {
    console.error("Bale delivery failed", error instanceof Error ? error.message : "Unknown error");
    return false;
  }
}
