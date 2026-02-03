// Signal Classifier with AI - Uses Claude API for intelligent classification
// Polls Telegram, classifies with AI, sends to dashboard - NO RESPONSE to user

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ;
const WEBHOOK_URL = process.env.WEBHOOK_URL || "http://localhost:3001/webhook/signal";
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN ;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

let lastUpdateId = 0;

// AI Classification using Claude
async function classifyWithAI(text) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `Classify this user message into exactly ONE category. Reply ONLY with valid JSON, nothing else.

Message: "${text}"

Categories:
- churning: user wants to cancel, leave, get refund
- frustration: user is angry, upset, something not working
- positive_feedback: user is happy, thankful, praising
- seeking_help: user has a question, needs assistance
- feature_request: user suggests improvement or new feature
- general: anything else

Reply format (JSON only):
{"intent": "category_name", "urgency": "critical|high|medium|low", "confidence": 0.0-1.0, "reason": "brief explanation"}`
        }]
      })
    });

    const data = await response.json();
    
    if (data.content && data.content[0] && data.content[0].text) {
      const jsonText = data.content[0].text.trim();
      const classification = JSON.parse(jsonText);
      console.log("[AI] Classification:", classification);
      return classification;
    }
  } catch (err) {
    console.error("[AI] Error:", err.message);
  }
  
  // Fallback
  return { intent: "general", urgency: "low", confidence: 0.5, reason: "AI error - fallback" };
}

// Send signal to dashboard
async function sendSignal(username, text, classification) {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-token": WEBHOOK_TOKEN
      },
      body: JSON.stringify({
        actor: username,
        text: text,
        source: "telegram",
        classification: {
          intent_stage: classification.intent,
          primary_pain: classification.reason,
          urgency: classification.urgency,
          confidence: classification.confidence,
          model: "claude-3-haiku"
        }
      })
    });
    
    const result = await response.json();
    console.log(`[SIGNAL] Sent: ${classification.intent} (${classification.urgency}) - "${text.substring(0, 40)}..."`);
    return result;
  } catch (err) {
    console.error("[SIGNAL] Error sending:", err.message);
  }
}

// Get updates from Telegram
async function getUpdates() {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.ok || !data.result) return;
    
    for (const update of data.result) {
      lastUpdateId = update.update_id;
      
      // Support both messages (DM/group) and channel_post (channels)
      const message = update.message || update.channel_post;
      if (!message || !message.text) continue;
      
      // Get username from message or channel
      let username;
      if (message.from) {
        username = message.from.username || message.from.first_name || `user_${message.from.id}`;
      } else if (message.sender_chat) {
        username = message.sender_chat.title || `channel_${message.sender_chat.id}`;
      } else {
        username = "unknown";
      }
      const text = message.text;
      
      // Skip commands
      if (text.startsWith("/")) continue;
      
      console.log(`[MSG] From ${username}: "${text}"`);
      
      // Classify with AI and send
      const classification = await classifyWithAI(text);
      await sendSignal(username, text, classification);
      
      // NO RESPONSE to user - silent classification
    }
  } catch (err) {
    console.error("[POLL] Error:", err.message);
  }
}

// Main loop
async function main() {
  console.log("[CLASSIFIER] Starting AI signal classifier...");
  console.log("[CLASSIFIER] Using Claude Haiku for classification");
  console.log("[CLASSIFIER] Polling Telegram (silent mode - no replies)...");
  
  // Delete webhook to enable polling
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
  console.log("[CLASSIFIER] Webhook cleared, polling active");
  
  while (true) {
    await getUpdates();
  }
}

main().catch(console.error);
