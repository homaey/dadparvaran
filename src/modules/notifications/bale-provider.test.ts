import { afterEach,describe,expect,it,vi } from "vitest";import { BaleBotApiProvider,notifyAdminViaBale } from "./bale-provider";
afterEach(()=>{vi.unstubAllGlobals();delete process.env.BALE_BOT_TOKEN;delete process.env.BALE_ADMIN_CHAT_ID});
describe("Bale provider",()=>{
  it("uses Bale Bot API sendMessage with JSON",async()=>{const fetchMock=vi.fn().mockResolvedValue({ok:true,json:async()=>({ok:true,result:{message_id:1}})});vi.stubGlobal("fetch",fetchMock);await new BaleBotApiProvider("secret").send({chatId:"123",title:"هشدار",message:"مهلت گذشته است"});expect(fetchMock).toHaveBeenCalledWith("https://tapi.bale.ai/botsecret/sendMessage",expect.objectContaining({method:"POST"}));const body=JSON.parse(fetchMock.mock.calls[0][1].body);expect(body).toEqual({chat_id:"123",text:"هشدار\n\nمهلت گذشته است"})});
  it("surfaces Bale errors",async()=>{vi.stubGlobal("fetch",vi.fn().mockResolvedValue({ok:false,status:400,json:async()=>({ok:false,description:"chat not found"})}));await expect(new BaleBotApiProvider("secret").send({chatId:"x",title:"t",message:"m"})).rejects.toThrow("chat not found")});
});
describe("notifyAdminViaBale",()=>{
  it("returns false and sends nothing when env is unset",async()=>{const fetchMock=vi.fn();vi.stubGlobal("fetch",fetchMock);expect(await notifyAdminViaBale("t","m")).toBe(false);expect(fetchMock).not.toHaveBeenCalled()});
  it("sends to the configured admin chat id",async()=>{process.env.BALE_BOT_TOKEN="secret";process.env.BALE_ADMIN_CHAT_ID="999";const fetchMock=vi.fn().mockResolvedValue({ok:true,json:async()=>({ok:true,result:{message_id:1}})});vi.stubGlobal("fetch",fetchMock);expect(await notifyAdminViaBale("عنوان","متن")).toBe(true);const body=JSON.parse(fetchMock.mock.calls[0][1].body);expect(body.chat_id).toBe("999")});
  // مهم: خطای پیام‌رسان نباید به فراخوان (مثلاً ثبت فرم تماس) سرایت کند.
  it("swallows delivery errors instead of throwing",async()=>{process.env.BALE_BOT_TOKEN="secret";process.env.BALE_ADMIN_CHAT_ID="999";vi.stubGlobal("fetch",vi.fn().mockRejectedValue(new Error("network down")));vi.spyOn(console,"error").mockImplementation(()=>{});expect(await notifyAdminViaBale("t","m")).toBe(false)});
});
