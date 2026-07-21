export type BaleChatId = string | number;

export interface BaleApiResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
  parameters?: { retry_after?: number };
}

export interface BaleUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface BaleChat {
  id: number;
  type: "private" | "group" | "supergroup" | "channel" | string;
  title?: string;
  username?: string;
}

export interface BaleMessage {
  message_id: number;
  date: number;
  chat: BaleChat;
  from?: BaleUser;
  text?: string;
  web_app_data?: { data: string };
}

export interface BaleCallbackQuery {
  id: string;
  from: BaleUser;
  message?: BaleMessage;
  data?: string;
}

export interface BaleUpdate {
  update_id: number;
  message?: BaleMessage;
  edited_message?: BaleMessage;
  callback_query?: BaleCallbackQuery;
}

export interface BaleWebAppInfo {
  url: string;
}

export interface BaleCopyTextButton {
  text: string;
}

export interface BaleInlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: BaleWebAppInfo;
  copy_text?: BaleCopyTextButton;
}

export interface BaleInlineKeyboardMarkup {
  inline_keyboard: BaleInlineKeyboardButton[][];
}

export interface BaleChatMember {
  status: "creator" | "administrator" | "member" | "restricted" | string;
  user: BaleUser;
  is_member?: boolean;
}

export interface BaleWebhookInfo {
  url: string;
  has_custom_certificate?: boolean;
  pending_update_count?: number;
  last_error_date?: number;
  last_error_message?: string;
}
