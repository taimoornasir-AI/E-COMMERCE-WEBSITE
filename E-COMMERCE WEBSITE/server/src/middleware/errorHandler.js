// Global error handler middleware
export const errorHandler = (err, _req, res, _next) => {
  console.error(`[Error] ${err.message}`, err.stack);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'A record with that value already exists.',
      field: err.meta?.target,
    });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Record not found.',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token expired.' });
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(422).json({
      success: false,
      error: 'Validation failed.',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, error: 'File too large. Max size is 10MB.' });
  }

  // Default
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Async handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create HTTP error
export const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};
