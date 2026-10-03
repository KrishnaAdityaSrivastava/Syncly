const errorMiddleware = (err, req, res, _next) => {
    let error = { ...err };
    error.message = err.message;

    console.error(JSON.stringify({
      level: "error",
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    }));

    // Handle built-in errors
    if (err.name === "CastError") {
      error = new Error("Resource not found");
      error.errorType = "INVALID_RESOURCE_ID";
      error.statusCode = 404;
    }

    if (err.code === 11000) {
      error = new Error("Duplicate field value entered");
      error.errorType = "DUPLICATE_KEY";
      error.statusCode = 400;
    }

    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map(val => val.message).join(", ");
      error = new Error(message);
      error.errorType = "VALIDATION_ERROR";
      error.statusCode = 400;
    }

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      errorType: error.errorType || "SERVER_ERROR",
      message: statusCode >= 500 ? "Internal server error" : (error.message || "Request failed"),
      requestId: req.requestId,
    });
};

export default errorMiddleware;
