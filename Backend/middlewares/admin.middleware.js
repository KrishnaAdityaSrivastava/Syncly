const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, errorType: "FORBIDDEN", message: "Admin access required", requestId: req.requestId });
  }

  return next();
};

export default requireAdmin;
