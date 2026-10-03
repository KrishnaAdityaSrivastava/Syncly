export const createHttpError = (statusCode, message, errorType = "REQUEST_ERROR") => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errorType = errorType;
  return error;
};

export const requireString = (value, field, { min = 1, max = 0 } = {}) => {
  if (typeof value !== "string") {
    throw createHttpError(400, `${field} is required`, "VALIDATION_ERROR");
  }

  const normalized = value.trim();
  if (normalized.length < min || (max && normalized.length > max)) {
    throw createHttpError(400, `${field} is invalid`, "VALIDATION_ERROR");
  }

  return normalized;
};

export const normalizeEmail = (value) => {
  const email = requireString(value, "Email", { min: 5, max: 255 }).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw createHttpError(400, "Email is invalid", "VALIDATION_ERROR");
  }
  return email;
};
