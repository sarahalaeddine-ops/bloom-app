import { buildSystemPrompt, demoReply } from "../../../lib/nora";

// Nora chat. Calls the Anthropic API server-side so the key never reaches the browser.
// Without ANTHROPIC_API_KEY it answers with scripted demo replies.
var MODEL = process.env.NORA_MODEL || "claude-sonnet-4-6";

export async function POST(request) {
  var body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  var messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter(function (m) { return (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim(); })
    .slice(-20)
    .map(function (m) { return { role: m.role, content: m.content.slice(0, 4000) }; });

  // The API requires the conversation to start with a user turn.
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length) return Response.json({ error: "No message" }, { status: 400 });

  var last = messages[messages.length - 1].content;
  var lang = ["en", "ar", "fr"].indexOf(body.lang) !== -1 ? body.lang : "en";
  var key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ text: demoReply(last, lang), demo: true });

  try {
    var res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: buildSystemPrompt(body.user, lang),
        messages: messages,
      }),
    });
    var data = await res.json();
    if (!res.ok) throw new Error(data.error ? data.error.message : "API error " + res.status);
    var text = (data.content || []).filter(function (c) { return c.type === "text"; }).map(function (c) { return c.text; }).join("\n");
    return Response.json({ text: text || demoReply(last, lang) });
  } catch (err) {
    console.error("Nora API error:", err.message);
    return Response.json({ text: demoReply(last, lang), demo: true });
  }
}
