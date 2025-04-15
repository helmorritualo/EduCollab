import { StatusCodes } from "http-status-codes";

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
    this.message = message;
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
    this.message = message;
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
    this.message = message;
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
    this.message = message;
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
    this.message = message;
  }
}

export class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
    this.message = message;
  } 
}

export function makeError<TError extends Error>(error: TError) {
  const defaultError = {
    name: error.name,
    message: error.message,
  };

  //* Custom Errors 
  if (error.message.includes("Malformed JSON")) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      error: { 
        name: "BadRequestError", 
        message: error.message 
      },
    };
  }

  if (error instanceof BadRequestError) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      error: defaultError,
    };
  }

  if (error instanceof UnauthorizedError) {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      error: defaultError,
    };
  }

  if (error instanceof ForbiddenError) {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      error: defaultError,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      error: defaultError,
    };
  }

  if (error instanceof ConflictError) {
    return {
      statusCode: StatusCodes.CONFLICT,
      error: defaultError,
    };
  }

  if (error instanceof InternalServerError) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: defaultError,
    };
  }
}