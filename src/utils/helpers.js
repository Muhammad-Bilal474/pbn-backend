export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.data = null;
  }
}

export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};
