const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;

    console.error(err);

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

    res.status(error.statusCode || 500).json({
      success: false,
      errorType: error.errorType || "SERVER_ERROR",
      message: error.message || "Server Error",
    });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
