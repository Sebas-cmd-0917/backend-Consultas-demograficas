import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../../config/logger.config';

export interface AppError extends Error {
  statusCode?: number;
  details?: any;
}

/**
 * Global exception filter to handle all errors thrown within the application.
 */
export const globalExceptionFilter = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let details = error.details || null;

  // Handle schema validation errors thrown by Zod
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    details = error.issues.map((err) => ({
      path: err.path.join('.'),
      message: err.message
    }));
  }

  // Log the exception
  logger.error(`${req.method} ${req.originalUrl} - Status: ${statusCode} - Message: ${message}`);
  
  if (error.stack && process.env.NODE_ENV === 'development') {
    logger.debug(`Stack Trace: ${error.stack}`);
  }

  // Format and send the response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    details,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack
    }),
  });
};
