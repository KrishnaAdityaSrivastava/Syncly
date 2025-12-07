export const parseExpiryToMs = (expiry) => {
  if (!isNaN(expiry)) return parseInt(expiry, 10) * 1000;

  const match = expiry.match(/^(\d+)([smhd])$/); // e.g. 5h, 10m
  if (!match) throw new Error("Invalid expiry format");

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s": return value * 1000;
    case "m": return value * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "d": return value * 24 * 60 * 60 * 1000;
    default: throw new Error("Unsupported unit");
  }
};
