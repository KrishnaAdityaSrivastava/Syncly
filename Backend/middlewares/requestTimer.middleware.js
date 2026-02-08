import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ---- path setup (ESM safe) ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, "../logs");

// ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ---- session setup ----
const SESSION_ID = new Date().toISOString().replace(/[:.]/g, "-");
const LOG_FILE = path.join(
  LOG_DIR,
  `perf-log-${SESSION_ID}.json`
);

// ---- in-memory aggregation ----
const stats = {};

// flush interval (every 30s)
const FLUSH_INTERVAL_MS = 30_000;
let flushTimer = null;

// ---- helper: flush stats to file ----
const flushStatsToFile = () => {
  const snapshot = {
    sessionId: SESSION_ID,
    flushedAt: new Date().toISOString(),
    endpoints: stats
  };

  fs.writeFileSync(LOG_FILE, JSON.stringify(snapshot, null, 2));
};

// periodic flush
flushTimer = setInterval(flushStatsToFile, FLUSH_INTERVAL_MS);

// ---- graceful shutdown ----
const shutdown = () => {
  console.log("[perf-log] flushing stats before shutdown...");
  try {
    flushStatsToFile();
  } catch (err) {
    console.error("[perf-log] flush failed:", err);
  } finally {
    clearInterval(flushTimer);
    process.exit(0);
  }
};

process.on("SIGINT", shutdown);   // Ctrl+C
process.on("SIGTERM", shutdown);  // kill / docker / pm2
process.on("exit", flushStatsToFile);

// ---- middleware ----
const requestTimer = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    const key = `${req.method} ${req.originalUrl}`;

    if (!stats[key]) {
      stats[key] = {
        count: 0,
        slowCount: 0,
        totalDurationMs: 0,
        avgDurationMs: 0,
        maxDurationMs: 0,
        lastStatus: null
      };
    }

    const entry = stats[key];

    entry.count += 1;
    entry.totalDurationMs += durationMs;
    entry.avgDurationMs = Number(
      (entry.totalDurationMs / entry.count).toFixed(2)
    );
    entry.maxDurationMs = Math.max(entry.maxDurationMs, durationMs);
    entry.lastStatus = res.statusCode;

    if (durationMs > 500) {
      entry.slowCount += 1;
    }
  });

  next();
};

export default requestTimer;
