import { Roles } from "@/lib/roles";
import { NotificationType,TaskStatus } from "@/lib/content-enums";import { db } from "@/lib/db";import { getTelegramProvider } from "@/modules/notifications/telegram-provider";
const finished=[TaskStatus.APPROVED,TaskStatus.PUBLISHED];const active=[TaskStatus.ASSIGNED,TaskStatus.RESEARCHING,TaskStatus.DRAFT,TaskStatus.REVIEW,TaskStatus.REVISION,TaskStatus.OVERDUE];
const hoursAgo=(hours:number,now:Date)=>new Date(now.getTime()-hours*3600000);
function tehranDateKey(date:Date){return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Tehran",year:"numeric",month:"2-digit",day:"2-digit"}).format(date)}
async function notifyAdmins(type:NotificationType,title:string,message:string,dedupeSuffix:string,taskId?:number){const admins=await db.user.findMany({where:{role:Roles.ADMIN},select:{id:true,telegramId:true}});const telegram=getTelegramProvider();for(const admin of admins){const dedupeKey=`admin-alert:${type}:${dedupeSuffix}:${admin.id}`;const notification=await db.notification.upsert({where:{dedupeKey},update:{},create:{userId:admin.id,taskId,type,title,message,scheduledFor:new Date(),dedupeKey}});if(notification.status!=="PENDING"||!admin.telegramId||!telegram)continue;try{await telegram.send({telegramId:admin.telegramId,title,message});await db.notification.update({where:{id:notification.id},data:{channel:"TELEGRAM",status:"SENT",sentAt:new Date()}})}catch(e){console.error("Telegram delivery failed",e)}}}
export async function runManagementAlerts(now=new Date()){
  const inactivityHours=Number(process.env.INACTIVITY_HOURS??48);const stuckHours=Number(process.env.WORKFLOW_STUCK_HOURS??72);
  const [missed,inactive,stuck]=await Promise.all([
    db.task.findMany({where:{deadline:{lt:now},status:{notIn:finished}},select:{id:true,title:true,deadline:true}}),
    db.task.findMany({where:{status:{in:[TaskStatus.ASSIGNED,TaskStatus.RESEARCHING,TaskStatus.DRAFT]},updatedAt:{lt:hoursAgo(inactivityHours,now)}},select:{id:true,title:true,updatedAt:true}}),
    db.task.findMany({where:{status:{in:[TaskStatus.REVIEW,TaskStatus.REVISION]},updatedAt:{lt:hoursAgo(stuckHours,now)}},select:{id:true,title:true,status:true,updatedAt:true}}),
  ]);
  for(const t of missed)await notifyAdmins(NotificationType.OVERDUE_ALERT,"مهلت مقاله گذشته است",`مقاله «${t.title}» از مهلت تعیین‌شده عبور کرده است.`,`missed:${t.id}`,t.id);
  for(const t of inactive)await notifyAdmins(NotificationType.ARTICLE_INACTIVE,"مقاله غیرفعال",`مقاله «${t.title}» بیش از ${inactivityHours} ساعت فعالیتی نداشته است.`,`inactive:${t.id}:${tehranDateKey(now)}`,t.id);
  for(const t of stuck)await notifyAdmins(NotificationType.WORKFLOW_STUCK,"گردش کار متوقف‌شده",`مقاله «${t.title}» بیش از ${stuckHours} ساعت در وضعیت ${t.status} مانده است.`,`stuck:${t.id}:${tehranDateKey(now)}`,t.id);
  return {missed:missed.length,inactive:inactive.length,stuck:stuck.length};
}
export async function sendDailySummary(now=new Date()){
  const start=new Date(now);start.setUTCHours(0,0,0,0);const [completed,pending,overdue]=await Promise.all([db.task.count({where:{OR:[{approvedAt:{gte:start,lte:now}},{publishedAt:{gte:start,lte:now}}]}}),db.task.count({where:{status:{in:active}}}),db.task.count({where:{OR:[{status:TaskStatus.OVERDUE},{deadline:{lt:now},status:{notIn:finished}}]}})]);
  const message=`گزارش امروز:\n\nتکمیل‌شده: ${completed} مقاله\nدر انتظار: ${pending} مقاله\nعقب‌افتاده: ${overdue} مقاله`;await notifyAdmins(NotificationType.DAILY_SUMMARY,"خلاصه روزانه مدیریت محتوا",message,tehranDateKey(now));return {completed,pending,overdue};
}
