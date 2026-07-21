const token = process.env.BALE_BOT_TOKEN;
if (!token) throw new Error("BALE_BOT_TOKEN is required");
const baseUrl = (process.env.BALE_API_BASE_URL || "https://tapi.bale.ai").replace(/\/$/, "");
const response = await fetch(`${baseUrl}/bot${token}/getWebhookInfo`, { method: "POST" });
const payload = await response.json();
if (!response.ok || !payload.ok) throw new Error(payload.description || `HTTP ${response.status}`);
console.log(JSON.stringify(payload.result, null, 2));
