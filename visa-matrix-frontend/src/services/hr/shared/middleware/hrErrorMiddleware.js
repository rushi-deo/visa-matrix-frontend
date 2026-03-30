export const hrErrorMiddleware = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode = error.statusCode ?? error.status ?? 500;
  res.status(statusCode).json({
    success: false,
    error: error.message ?? "Unhandled HR module error.",
    details: error.details ?? null,
    module: "hr",
  });
};

