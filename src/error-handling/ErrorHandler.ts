import express from 'express';

import { StatusCodes } from 'http-status-codes';

import CustomError from './CustomError';

export class ErrorHandler {
  static SERVER_ERROR_MESSAGE = 'Internal server error';

  handleError(
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
    if (err instanceof CustomError) {
      const { statusCode, message } = err;
      res.status(statusCode).json({ status: 'error', statusCode, message });
    } else {
      const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      const message = ErrorHandler.SERVER_ERROR_MESSAGE;
      res.status(statusCode).json({ status: 'error', statusCode, message });
    }
    next();
  }

  static handleErrors(
    routeFunction: express.RequestHandler
  ): express.RequestHandler {
    async function inner(
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) {
      try {
        await routeFunction(req, res, next);
      } catch (err) {
        next(err);
      }
    }
    return inner;
  }
}
