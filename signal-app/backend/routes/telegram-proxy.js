import { Router } from "express";
import { signals } from "./signals.js";

export const telegramProxyRouter = Router();

// Classification basee sur le contenu du message
function classifyMessage(text) {
  const lowerText = text.toLowerCase();
  
  // Patterns de classification
  const patterns = {
    frustration: {
      keywords: ["marche pas", "ne marche pas", "bug", "probleme", "erreur", "nul", "horrible", 
                 "does not work", "not working", "broken", "upset", "angry", "furieux", "enerve",
                 "impossible"],
      urgency: "high",
      confidence: 0.8
    },
    churning: {
      keywords: ["annuler", "resilier", "quitter", "partir", "cancel", "unsubscribe", "leaving",
                 "je pars", "je quitte", "remboursement", "refund", "arreter", "stop using"],
      urgency: "critical",
      confidence: 0.9
    },
    positive_feedback: {
      keywords: ["merci", "super", "genial", "excellent", "parfait", "bravo", "thanks",
                 "great", "awesome", "love it", "jadore", "incroyable", "top", "bien joue"],
      urgency: "low",
      confidence: 0.85
    },
    seeking_help: {
      keywords: ["comment", "aide", "help", "how to", "how do", "question", "besoin aide",
                 "je comprends pas", "expliquer", "explain", "pourquoi", "why"],
      urgency: "medium",
      confidence: 0.7
    },
    feature_request: {
      keywords: ["ce serait bien", "il faudrait", "suggestion", "ameliorer", "ajouter",
                 "would be nice", "feature", "request", "idee", "idea", "pourriez-vous"],
      urgency: "medium",
      confidence: 0.75
    }
  };

  for (const [intent, config] of Object.entries(patterns)) {
    for (const keyword of config.keywords) {
      if (lowerText.includes(keyword)) {
        return {
          intent,
          urgency: config.urgency,
          confidence: config.confidence
        };
      }
    }
  }

  // Default classification
  return {
    intent: "general_inquiry",
    urgency: "low",
    confidence: 0.5
  };
}

// Endpoint pour recevoir les messages Telegram (webhook mode)
telegramProxyRouter.post("/telegram-webhook/:botToken", async (req, res) => {
  try {
    const { botToken } = req.params;
    const update = req.body;
    
    console.log("[TELEGRAM-PROXY] Received update:", JSON.stringify(update, null, 2));
    
    // Extraire le message
    const message = update.message || update.edited_message;
    if (!message || !message.text) {
      return res.json({ ok: true, skipped: "no text message" });
    }
    
    const { text, from, chat } = message;
    const username = from.username || from.first_name || ("user_" + from.id);
    
    // Classifier le message
    const classification = classifyMessage(text);
    
    console.log("[TELEGRAM-PROXY] Classified message as:", classification);
    
    // Creer le signal
    const signalId = "sig_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    const signal = {
      id: signalId,
      actor: username,
      text: text,
      source: "telegram",
      classification: {
        intent: classification.intent,
        urgency: classification.urgency,
        confidence: classification.confidence,
        model: "keyword-classifier-v1"
      },
      metadata: {
        telegram_chat_id: chat.id,
        telegram_user_id: from.id,
        bot_token_prefix: botToken.substring(0, 8) + "..."
      },
      timestamp: new Date().toISOString(),
      status: "new"
    };
    
    // Stocker dans le meme store que les autres signaux
    signals.set(signalId, signal);
    
    console.log("[TELEGRAM-PROXY] Created signal:", signalId);
    console.log("[TELEGRAM-PROXY] Total signals in store:", signals.size);
    
    res.json({ 
      ok: true, 
      signal_id: signalId,
      classification: classification
    });
    
  } catch (error) {
    console.error("[TELEGRAM-PROXY] Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de test
telegramProxyRouter.get("/telegram-proxy/status", (req, res) => {
  res.json({
    status: "active",
    signals_count: signals.size,
    timestamp: new Date().toISOString()
  });
});
