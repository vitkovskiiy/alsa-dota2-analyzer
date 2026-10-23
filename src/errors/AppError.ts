export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace?.(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, details)
    this.name = 'BadRequestError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super(404, message, details)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(409, message, details)
    this.name = 'ConflictError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, details?: unknown) {
    super(401, message, details)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, details?: unknown) {
    super(403, message, details)
    this.name = 'ForbiddenError'
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string, details?: unknown) {
    super(503, message, details)
    this.name = 'ServiceUnavailableError'
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, details?: unknown) {
    super(500, message, details)
    this.name = 'InternalServerError'
  }
}
