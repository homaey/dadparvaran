export interface TelegramNotificationProvider { send(input:{telegramId:string;title:string;message:string}):Promise<void> }
export class TelegramBotApiProvider implements TelegramNotificationProvider {
  constructor(private readonly token:string){}
  async send(input:{telegramId:string;title:string;message:string}){const response=await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:input.telegramId,text:`${input.title}\n\n${input.message}`})});const data=await response.json() as {ok?:boolean;description?:string};if(!response.ok||!data.ok)throw new Error(data.description??`Telegram error (${response.status})`)}
}
export function getTelegramProvider():TelegramNotificationProvider|null{const token=process.env.TELEGRAM_BOT_TOKEN;return token?new TelegramBotApiProvider(token):null}
