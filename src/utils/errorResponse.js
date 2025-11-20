export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function handleError(res, error) {
  const status = error.statusCode || 500;
  res.status(status).json({
    error: error.message || 'Internal server error'
  });
}
