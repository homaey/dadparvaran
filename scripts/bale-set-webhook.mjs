const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const token = required("BALE_BOT_TOKEN");
const siteUrl = required("SITE_URL").replace(/\/$/, "");
const secret = required("BALE_WEBHOOK_PATH_SECRET");
const baseUrl = (process.env.BALE_API_BASE_URL || "https://tapi.bale.ai").replace(/\/$/, "");
const webhookUrl = `${siteUrl}/api/integrations/bale/webhook/${encodeURIComponent(secret)}`;

const response = await fetch(`${baseUrl}/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: webhookUrl }),
});
const payload = await response.json();
if (!response.ok || !payload.ok) throw new Error(payload.description || `HTTP ${response.status}`);
console.log(JSON.stringify({ ok: true, webhookUrl }, null, 2));
