import crypto from "node:crypto";

export const securityHeaders = (_req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
  next();
};

export const requestId = (req, res, next) => {
  const id = crypto.randomUUID();
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
};

export const requestTimeout = (timeoutMs) => (req, res, next) => {
  res.setTimeout(timeoutMs, () => {
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        errorType: "REQUEST_TIMEOUT",
        message: "Request timed out",
        requestId: req.requestId,
      });
    }
  });
  next();
};
