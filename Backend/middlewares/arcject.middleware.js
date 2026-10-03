import aj from '../config/arcject.js'
import { ARCJET_KEY } from "../config/env.js";

const arcjetMiddleware = async (req, res, next) => {
    if (!ARCJET_KEY) return next();
    try {
        const decision = await aj.protect(req, { requested: 1 })

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) return res.status(429).json({ success: false, errorType: "RATE_LIMITED", message: 'Rate limit exceeded', requestId: req.requestId });

            if (decision.reason.isBot()) return res.status(403).json({ success: false, errorType: "BOT_DETECTED", message: 'Bot detected', requestId: req.requestId });

            return res.status(403).json({ success: false, errorType: "ACCESS_DENIED", message: 'Access denied', requestId: req.requestId });
        }
        next();
    }
    catch (error) {
        console.error(`Arcjet Middleware Error: ${error}`);
        next(error);
    }
}

export default arcjetMiddleware;
