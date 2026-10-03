const clients = new Map();

const rateLimit = ({ windowMs, max, key = (req) => req.ip }) => (req, res, next) => {
  const now = Date.now();
  const clientKey = key(req);
  const entry = clients.get(clientKey);

  if (clients.size > 10000) {
    for (const [storedKey, storedEntry] of clients) {
      if (storedEntry.resetAt <= now) clients.delete(storedKey);
    }
  }

  if (!entry || entry.resetAt <= now) {
    clients.set(clientKey, { count: 1, resetAt: now + windowMs });
    return next();
  }

  entry.count += 1;
  if (entry.count > max) {
    res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
    return res.status(429).json({
      success: false,
      errorType: "RATE_LIMITED",
      message: "Too many requests. Please try again shortly.",
      requestId: req.requestId,
    });
  }

  return next();
};

export default rateLimit;
