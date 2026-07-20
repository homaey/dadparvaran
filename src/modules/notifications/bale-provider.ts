// پیام‌رسان «بله» جایگزین تلگرام شده است: سرور ایران به api.telegram.org
// دسترسی ندارد (درخواست خروجی اصلاً پاسخی نمی‌گیرد)، در حالی که tapi.bale.ai
// در دسترس است. Bot API بله هم‌شکل تلگرام است: همان sendMessage با chat_id/text
// و همان پاسخ {ok, description}.
const BALE_API_BASE = "https://tapi.bale.ai";

export interface BaleNotificationProvider { send(input:{chatId:string;title:string;message:string}):Promise<void> }

export class BaleBotApiProvider implements BaleNotificationProvider {
  constructor(private readonly token:string){}
  async send(input:{chatId:string;title:string;message:string}){const response=await fetch(`${BALE_API_BASE}/bot${this.token}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:input.chatId,text:`${input.title}\n\n${input.message}`})});const data=await response.json() as {ok?:boolean;description?:string};if(!response.ok||!data.ok)throw new Error(data.description??`Bale error (${response.status})`)}
}

export function getBaleProvider():BaleNotificationProvider|null{const token=process.env.BALE_BOT_TOKEN;return token?new BaleBotApiProvider(token):null}

/**
 * ارسال اعلان عملیاتی به مقصد ثابت مدیر (BALE_ADMIN_CHAT_ID).
 *
 * عمداً به جدول Notification و به User.baleId وابسته نیست: جدول Notification
 * روی پروداکشن وجود ندارد، و هیچ رابط کاربری برای پر کردن baleId ساخته نشده.
 * با این طراحی، اعلان فقط با تنظیم دو متغیر محیطی کار می‌کند.
 *
 * هرگز throw نمی‌کند — فراخوان نباید به‌خاطر خطای پیام‌رسان شکست بخورد.
 */
export async function notifyAdminViaBale(title:string,message:string):Promise<boolean>{
  const chatId=process.env.BALE_ADMIN_CHAT_ID;
  const provider=getBaleProvider();
  if(!chatId||!provider)return false;
  try{await provider.send({chatId,title,message});return true}
  catch(e){console.error("Bale delivery failed",e);return false}
}
