import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { signals } from "./signals.js";

export const webhookRouter = Router();

// Verify webhook token
function verifyWebhookToken(req, res, next) {
  const token = req.headers["x-webhook-token"] || req.query.token;
  
  if (!token || token !== process.env.SIGNAL_AGENT_TOKEN) {
    return res.status(401).json({ error: "Invalid webhook token" });
  }
  
  next();
}

// Receive signal from SignalIntell agent
webhookRouter.post("/signal", verifyWebhookToken, (req, res) => {
  // Support both old format (actor/text) and new format (user_handle/content)
  const actor = req.body.actor || req.body.user_handle || "unknown";
  const text = req.body.text || req.body.content || "";
  const avatar = req.body.avatar || "👤";
  const source = req.body.source || "telegram";
  const followers = req.body.followers || req.body.followers_count || "0";
  
  // Classification from body or default
  const classification = req.body.classification || {
    intent_stage: req.body.intent_stage || "unknown",
    primary_pain: req.body.primary_pain || "unknown",
    urgency: req.body.urgency || "medium",
    confidence: req.body.confidence || 0.5,
    momentum_flag: req.body.momentum_flag || false,
    momentum_count: 0,
    recommended_action: req.body.recommended_action || "review",
    suggested_reply: req.body.suggested_reply || ""
  };

  if (!text) {
    return res.status(400).json({ error: "Missing required fields: text/content" });
  }

  const signal = {
    id: "sig_" + uuidv4().slice(0, 8),
    actor,
    avatar,
    text,
    source,
    followers: String(followers),
    tweetId: req.body.tweetId,
    tweetUrl: req.body.tweetUrl,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    classification,
    status: null
  };

  signals.set(signal.id, signal);

  console.log(`[WEBHOOK] New signal from ${actor}: ${text.slice(0, 50)}...`);
  res.json({ 
    success: true, 
    signal_id: signal.id,
    message: "Signal received"
  });
});

// Batch import signals
webhookRouter.post("/signals/batch", verifyWebhookToken, (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "items must be an array" });
  }

  const imported = [];
  
  for (const item of items) {
    const actor = item.actor || item.user_handle || "unknown";
    const text = item.text || item.content || "";
    
    if (!text) continue;

    const signal = {
      id: "sig_" + uuidv4().slice(0, 8),
      actor,
      avatar: item.avatar || "👤",
      text,
      source: item.source || "telegram",
      followers: String(item.followers || item.followers_count || "0"),
      tweetId: item.tweetId,
      tweetUrl: item.tweetUrl,
      timestamp: item.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      classification: item.classification || {
        intent_stage: item.intent_stage || "unknown",
        primary_pain: item.primary_pain || "unknown",
        urgency: item.urgency || "medium",
        confidence: item.confidence || 0.5,
        momentum_flag: item.momentum_flag || false,
        momentum_count: 0,
        recommended_action: item.recommended_action || "review",
        suggested_reply: item.suggested_reply || ""
      },
      status: null
    };

    signals.set(signal.id, signal);
    imported.push(signal.id);
  }

  console.log(`[WEBHOOK] Batch import: ${imported.length} signals`);
  
  res.json({ 
    success: true, 
    imported: imported.length,
    signal_ids: imported
  });
});

// Get webhook status
webhookRouter.get("/status", verifyWebhookToken, (req, res) => {
  res.json({
    status: "active",
    signals_count: signals.size,
    timestamp: new Date().toISOString()
  });
});
