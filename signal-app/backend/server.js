import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { authRouter } from "./routes/auth.js";
import { signalsRouter, signals } from "./routes/signals.js";
import { webhookRouter } from "./routes/webhook.js";
import { telegramProxyRouter } from "./routes/telegram-proxy.js";
import { authMiddleware } from "./middleware/auth.js";
import { rateLimiter } from "./middleware/rateLimit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", "https://grumpy-generator.github.io", "http://82.165.15.190"],
  credentials: true
}));
app.use(express.json());
app.use(rateLimiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Public routes
app.use("/auth", authRouter);

// Webhook for SignalIntell agent (token-protected)
app.use("/webhook", webhookRouter);

// Telegram proxy for direct message classification
app.use("/", telegramProxyRouter);

// Protected routes
// Public demo endpoint (no auth)
app.get("/api/demo/signals", (req, res) => {
  const signalList = Array.from(signals.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 30);
  res.json({ signals: signalList, total: signals.size });
});

app.use("/api/signals", authMiddleware, signalsRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message
  });
});

app.listen(PORT, () => {
  console.log("[SIGNAL-API] Running on port " + PORT);
  console.log("[SIGNAL-API] Environment: " + (process.env.NODE_ENV || "development"));
});
