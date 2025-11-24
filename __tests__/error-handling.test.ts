/**
 * Unit Tests for Error Handling System
 * 
 * Tests the error handling utilities, error classes, and validation helpers.
 */

import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessLogicError,
  ErrorCodes,
  formatErrorResponse,
  getUserFriendlyMessage,
  validateRequiredFields,
  validateEmail,
  validatePhone,
  validateFileSize,
  validateFileType,
  HttpStatus,
  isSuccessStatus,
  isClientError,
  isServerError,
} from '@/lib/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with all properties', () => {
      const error = new AppError(
        ErrorCodes.INTERNAL_ERROR,
        'Test error',
        500,
        { detail: 'test' }
      );

      expect(error.code).toBe(ErrorCodes.INTERNAL_ERROR);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.name).toBe('AppError');
    });

    it('should default to status code 500', () => {
      const error = new AppError(ErrorCodes.INTERNAL_ERROR, 'Test error');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('AuthenticationError', () => {
    it('should create an AuthenticationError with default message', () => {
      const error = new AuthenticationError();
      expect(error.code).toBe(ErrorCodes.UNAUTHORIZED);
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should create an AuthenticationError with custom message and code', () => {
      const error = new AuthenticationError('Invalid token', ErrorCodes.SESSION_EXPIRED);
      expect(error.code).toBe(ErrorCodes.SESSION_EXPIRED);
      expect(error.message).toBe('Invalid token');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('AuthorizationError', () => {
    it('should create an AuthorizationError with default message', () => {
      const error = new AuthorizationError();
      expect(error.code).toBe(ErrorCodes.FORBIDDEN);
      expect(error.message).toBe('Insufficient permissions');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });

    it('should create an AuthorizationError with custom message and code', () => {
      const error = new AuthorizationError('Admin only', ErrorCodes.ROLE_MISMATCH);
      expect(error.code).toBe(ErrorCodes.ROLE_MISMATCH);
      expect(error.message).toBe('Admin only');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with errors array', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'phone', message: 'Invalid phone' },
      ];
      const error = new ValidationError('Validation failed', errors);

      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ errors });
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with resource name', () => {
      const error = new NotFoundError('Lead');
      expect(error.code).toBe(ErrorCodes.NOT_FOUND);
      expect(error.message).toBe('Lead not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should create a NotFoundError with resource name and ID', () => {
      const error = new NotFoundError('Lead', '123');
      expect(error.message).toBe('Lead with id 123 not found');
    });

    it('should use default resource name', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('ConflictError', () => {
    it('should create a ConflictError', () => {
      const error = new ConflictError('Duplicate entry');
      expect(error.code).toBe(ErrorCodes.CONFLICT);
      expect(error.message).toBe('Duplicate entry');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });

    it('should create a ConflictError with custom code', () => {
      const error = new ConflictError('Already linked', ErrorCodes.LEAD_ALREADY_LINKED);
      expect(error.code).toBe(ErrorCodes.LEAD_ALREADY_LINKED);
    });
  });

  describe('BusinessLogicError', () => {
    it('should create a BusinessLogicError', () => {
      const error = new BusinessLogicError('Prerequisites not met');
      expect(error.code).toBe(ErrorCodes.UNPROCESSABLE_ENTITY);
      expect(error.message).toBe('Prerequisites not met');
      expect(error.statusCode).toBe(422);
      expect(error.name).toBe('BusinessLogicError');
    });

    it('should create a BusinessLogicError with custom code', () => {
      const error = new BusinessLogicError(
        'Documents missing',
        ErrorCodes.MANDATORY_DOCUMENTS_MISSING
      );
      expect(error.code).toBe(ErrorCodes.MANDATORY_DOCUMENTS_MISSING);
    });
  });
});

describe('Error Response Formatting', () => {
  describe('formatErrorResponse', () => {
    it('should format AppError instances', () => {
      const error = new AppError(ErrorCodes.INTERNAL_ERROR, 'Test error', 500, { detail: 'test' });
      const response = formatErrorResponse(error);

      expect(response.error.code).toBe(ErrorCodes.INTERNAL_ERROR);
      expect(response.error.message).toBe('Test error');
      expect(response.error.details).toEqual({ detail: 'test' });
      expect(response.error.timestamp).toBeDefined();
    });

    it('should format standard Error instances', () => {
      const error = new Error('Standard error');
      const response = formatErrorResponse(error);

      expect(response.error.code).toBe(ErrorCodes.INTERNAL_ERROR);
      expect(response.error.message).toBe('Standard error');
      expect(response.error.timestamp).toBeDefined();
    });

    it('should format unknown errors', () => {
      const response = formatErrorResponse('string error');

      expect(response.error.code).toBe(ErrorCodes.INTERNAL_ERROR);
      expect(response.error.message).toBe('An unexpected error occurred');
      expect(response.error.timestamp).toBeDefined();
    });

    it('should include timestamp in ISO format', () => {
      const error = new AppError(ErrorCodes.INTERNAL_ERROR, 'Test');
      const response = formatErrorResponse(error);

      expect(response.error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return user-friendly message for known error codes', () => {
      expect(getUserFriendlyMessage(ErrorCodes.UNAUTHORIZED)).toBe('Please log in to continue');
      expect(getUserFriendlyMessage(ErrorCodes.FORBIDDEN)).toBe(
        'You do not have permission to perform this action'
      );
      expect(getUserFriendlyMessage(ErrorCodes.NOT_FOUND)).toBe(
        'The requested resource was not found'
      );
    });

    it('should return default message for unknown error codes', () => {
      const message = getUserFriendlyMessage('UNKNOWN_CODE' as any);
      expect(message).toBe('An unexpected error occurred. Please try again');
    });
  });
});

describe('Validation Helpers', () => {
  describe('validateRequiredFields', () => {
    it('should return empty array when all required fields are present', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      };
      const required = [
        { field: 'name', label: 'Name' },
        { field: 'email', label: 'Email' },
        { field: 'phone', label: 'Phone' },
      ];

      const errors = validateRequiredFields(data, required);
      expect(errors).toEqual([]);
    });

    it('should return errors for missing fields', () => {
      const data = {
        name: 'John Doe',
      };
      const required = [
        { field: 'name', label: 'Name' },
        { field: 'email', label: 'Email' },
        { field: 'phone', label: 'Phone' },
      ];

      const errors = validateRequiredFields(data, required);
      expect(errors).toHaveLength(2);
      expect(errors[0]).toEqual({ field: 'email', message: 'Email is required' });
      expect(errors[1]).toEqual({ field: 'phone', message: 'Phone is required' });
    });

    it('should treat empty strings as missing', () => {
      const data = {
        name: '   ',
        email: '',
      };
      const required = [
        { field: 'name', label: 'Name' },
        { field: 'email', label: 'Email' },
      ];

      const errors = validateRequiredFields(data, required);
      expect(errors).toHaveLength(2);
    });

    it('should treat null and undefined as missing', () => {
      const data = {
        name: null,
        email: undefined,
      };
      const required = [
        { field: 'name', label: 'Name' },
        { field: 'email', label: 'Email' },
      ];

      const errors = validateRequiredFields(data, required);
      expect(errors).toHaveLength(2);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@example.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('1234567890')).toBe(true);
      expect(validatePhone('+1234567890')).toBe(true);
      expect(validatePhone('+1 (234) 567-8900')).toBe(true);
      expect(validatePhone('123-456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abc')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should validate file sizes within limit', () => {
      expect(validateFileSize(1024 * 1024, 5)).toBe(true); // 1MB, max 5MB
      expect(validateFileSize(5 * 1024 * 1024, 5)).toBe(true); // 5MB, max 5MB
      expect(validateFileSize(100, 5)).toBe(true); // 100 bytes, max 5MB
    });

    it('should reject file sizes exceeding limit', () => {
      expect(validateFileSize(6 * 1024 * 1024, 5)).toBe(false); // 6MB, max 5MB
      expect(validateFileSize(10 * 1024 * 1024, 5)).toBe(false); // 10MB, max 5MB
    });

    it('should use default max size of 5MB', () => {
      expect(validateFileSize(4 * 1024 * 1024)).toBe(true);
      expect(validateFileSize(6 * 1024 * 1024)).toBe(false);
    });
  });

  describe('validateFileType', () => {
    it('should validate allowed file types', () => {
      const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
      expect(validateFileType('image/jpeg', allowed)).toBe(true);
      expect(validateFileType('image/png', allowed)).toBe(true);
      expect(validateFileType('application/pdf', allowed)).toBe(true);
    });

    it('should reject disallowed file types', () => {
      const allowed = ['image/jpeg', 'image/png'];
      expect(validateFileType('application/pdf', allowed)).toBe(false);
      expect(validateFileType('video/mp4', allowed)).toBe(false);
      expect(validateFileType('text/plain', allowed)).toBe(false);
    });
  });
});

describe('HTTP Status Helpers', () => {
  describe('isSuccessStatus', () => {
    it('should identify success status codes', () => {
      expect(isSuccessStatus(200)).toBe(true);
      expect(isSuccessStatus(201)).toBe(true);
      expect(isSuccessStatus(204)).toBe(true);
      expect(isSuccessStatus(299)).toBe(true);
    });

    it('should reject non-success status codes', () => {
      expect(isSuccessStatus(199)).toBe(false);
      expect(isSuccessStatus(300)).toBe(false);
      expect(isSuccessStatus(400)).toBe(false);
      expect(isSuccessStatus(500)).toBe(false);
    });
  });

  describe('isClientError', () => {
    it('should identify client error status codes', () => {
      expect(isClientError(400)).toBe(true);
      expect(isClientError(401)).toBe(true);
      expect(isClientError(404)).toBe(true);
      expect(isClientError(499)).toBe(true);
    });

    it('should reject non-client-error status codes', () => {
      expect(isClientError(399)).toBe(false);
      expect(isClientError(500)).toBe(false);
      expect(isClientError(200)).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('should identify server error status codes', () => {
      expect(isServerError(500)).toBe(true);
      expect(isServerError(503)).toBe(true);
      expect(isServerError(504)).toBe(true);
      expect(isServerError(599)).toBe(true);
    });

    it('should reject non-server-error status codes', () => {
      expect(isServerError(499)).toBe(false);
      expect(isServerError(600)).toBe(false);
      expect(isServerError(200)).toBe(false);
      expect(isServerError(400)).toBe(false);
    });
  });
});

describe('Error Codes', () => {
  it('should have all required error codes defined', () => {
    // Authentication
    expect(ErrorCodes.UNAUTHORIZED).toBeDefined();
    expect(ErrorCodes.INVALID_CREDENTIALS).toBeDefined();
    expect(ErrorCodes.SESSION_EXPIRED).toBeDefined();

    // Authorization
    expect(ErrorCodes.FORBIDDEN).toBeDefined();
    expect(ErrorCodes.INSUFFICIENT_PERMISSIONS).toBeDefined();
    expect(ErrorCodes.ACCOUNT_DISABLED).toBeDefined();

    // Validation
    expect(ErrorCodes.VALIDATION_ERROR).toBeDefined();
    expect(ErrorCodes.MISSING_FIELDS).toBeDefined();
    expect(ErrorCodes.INVALID_FORMAT).toBeDefined();

    // Business Logic
    expect(ErrorCodes.UNPROCESSABLE_ENTITY).toBeDefined();
    expect(ErrorCodes.MANDATORY_DOCUMENTS_MISSING).toBeDefined();
    expect(ErrorCodes.STEP_PREREQUISITES_NOT_MET).toBeDefined();

    // Conflicts
    expect(ErrorCodes.CONFLICT).toBeDefined();
    expect(ErrorCodes.DUPLICATE_ENTRY).toBeDefined();

    // Not Found
    expect(ErrorCodes.NOT_FOUND).toBeDefined();
    expect(ErrorCodes.FILE_NOT_FOUND).toBeDefined();

    // Server Errors
    expect(ErrorCodes.INTERNAL_ERROR).toBeDefined();
    expect(ErrorCodes.DATABASE_ERROR).toBeDefined();
    expect(ErrorCodes.SERVICE_UNAVAILABLE).toBeDefined();
  });
});

describe('HttpStatus Constants', () => {
  it('should have all HTTP status codes defined', () => {
    expect(HttpStatus.OK).toBe(200);
    expect(HttpStatus.CREATED).toBe(201);
    expect(HttpStatus.NO_CONTENT).toBe(204);
    expect(HttpStatus.BAD_REQUEST).toBe(400);
    expect(HttpStatus.UNAUTHORIZED).toBe(401);
    expect(HttpStatus.FORBIDDEN).toBe(403);
    expect(HttpStatus.NOT_FOUND).toBe(404);
    expect(HttpStatus.CONFLICT).toBe(409);
    expect(HttpStatus.UNPROCESSABLE_ENTITY).toBe(422);
    expect(HttpStatus.INTERNAL_SERVER_ERROR).toBe(500);
    expect(HttpStatus.SERVICE_UNAVAILABLE).toBe(503);
  });
});

describe('API Error Handling Middleware', () => {
  // Import middleware functions
  const {
    handleAuthenticationError,
    handleAuthorizationError,
    handleValidationError,
    handleNotFoundError,
    handleConflictError,
    handleBusinessLogicError,
    handleServerError,
    handleServiceUnavailableError,
    handleGatewayTimeoutError,
    parseJsonBody,
    validateUuidParam,
  } = require('@/lib/api/error-middleware');

  describe('handleAuthenticationError', () => {
    it('should handle AuthenticationError instances', () => {
      const error = new AuthenticationError('Invalid token');
      const response = handleAuthenticationError(error);

      expect(response.status).toBe(401);
    });

    it('should handle non-AuthenticationError instances', () => {
      const error = new Error('Generic error');
      const response = handleAuthenticationError(error);

      expect(response.status).toBe(401);
    });
  });

  describe('handleAuthorizationError', () => {
    it('should handle AuthorizationError instances', () => {
      const error = new AuthorizationError('Access denied');
      const response = handleAuthorizationError(error);

      expect(response.status).toBe(403);
    });

    it('should handle non-AuthorizationError instances', () => {
      const error = new Error('Generic error');
      const response = handleAuthorizationError(error);

      expect(response.status).toBe(403);
    });
  });

  describe('handleValidationError', () => {
    it('should format validation errors correctly', () => {
      const errors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'phone', message: 'Phone number required' },
      ];
      const response = handleValidationError(errors);

      expect(response.status).toBe(400);
    });

    it('should include all validation errors in response', async () => {
      const errors = [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Email is required' },
      ];
      const response = handleValidationError(errors);
      const body = await response.json();

      expect(body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(body.error.details.errors).toHaveLength(2);
      expect(body.error.details.errors).toEqual(errors);
    });
  });

  describe('handleNotFoundError', () => {
    it('should handle not found errors with resource name', async () => {
      const response = handleNotFoundError('Lead');
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error.code).toBe(ErrorCodes.NOT_FOUND);
      expect(body.error.message).toBe('Lead not found');
    });

    it('should handle not found errors with resource name and ID', async () => {
      const response = handleNotFoundError('Lead', '123');
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error.message).toBe('Lead with id 123 not found');
    });

    it('should use default resource name when not provided', async () => {
      const response = handleNotFoundError();
      const body = await response.json();

      expect(body.error.message).toBe('Resource not found');
    });
  });

  describe('handleConflictError', () => {
    it('should handle conflict errors', async () => {
      const response = handleConflictError('Duplicate entry');
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body.error.code).toBe(ErrorCodes.CONFLICT);
      expect(body.error.message).toBe('Duplicate entry');
    });
  });

  describe('handleBusinessLogicError', () => {
    it('should handle business logic errors with default code', async () => {
      const response = handleBusinessLogicError('Prerequisites not met');
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body.error.code).toBe(ErrorCodes.UNPROCESSABLE_ENTITY);
      expect(body.error.message).toBe('Prerequisites not met');
    });

    it('should handle business logic errors with custom code', async () => {
      const response = handleBusinessLogicError(
        'Documents missing',
        ErrorCodes.MANDATORY_DOCUMENTS_MISSING
      );
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body.error.code).toBe(ErrorCodes.MANDATORY_DOCUMENTS_MISSING);
    });
  });

  describe('handleServerError', () => {
    it('should handle server errors', async () => {
      const error = new Error('Database connection failed');
      const response = handleServerError(error);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error.code).toBe(ErrorCodes.INTERNAL_ERROR);
      expect(body.error.message).toBe('An unexpected error occurred');
    });

    it('should sanitize error messages for security', async () => {
      const error = new Error('Sensitive database info');
      const response = handleServerError(error);
      const body = await response.json();

      // Should not expose internal error details
      expect(body.error.message).not.toContain('database');
      expect(body.error.message).toBe('An unexpected error occurred');
    });
  });

  describe('handleServiceUnavailableError', () => {
    it('should handle service unavailable errors with default message', async () => {
      const response = handleServiceUnavailableError();
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(body.error.code).toBe(ErrorCodes.SERVICE_UNAVAILABLE);
      expect(body.error.message).toBe('Service temporarily unavailable');
    });

    it('should handle service unavailable errors with custom message', async () => {
      const response = handleServiceUnavailableError('Database maintenance in progress');
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(body.error.message).toBe('Database maintenance in progress');
    });
  });

  describe('handleGatewayTimeoutError', () => {
    it('should handle gateway timeout errors with default message', async () => {
      const response = handleGatewayTimeoutError();
      const body = await response.json();

      expect(response.status).toBe(504);
      expect(body.error.code).toBe(ErrorCodes.GATEWAY_TIMEOUT);
      expect(body.error.message).toBe('Request timed out');
    });

    it('should handle gateway timeout errors with custom message', async () => {
      const response = handleGatewayTimeoutError('Database query timed out');
      const body = await response.json();

      expect(response.status).toBe(504);
      expect(body.error.message).toBe('Database query timed out');
    });
  });

  describe('parseJsonBody', () => {
    it('should parse valid JSON body', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ name: 'Test', email: 'test@example.com' }),
      } as any;

      const result = await parseJsonBody(mockRequest);

      expect(result).toEqual({ name: 'Test', email: 'test@example.com' });
      expect(mockRequest.json).toHaveBeenCalled();
    });

    it('should throw AppError for invalid JSON', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as any;

      await expect(parseJsonBody(mockRequest)).rejects.toThrow(AppError);
      await expect(parseJsonBody(mockRequest)).rejects.toMatchObject({
        code: ErrorCodes.INVALID_FORMAT,
        statusCode: 400,
      });
    });
  });

  describe('validateUuidParam', () => {
    it('should validate correct UUID format', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(() => validateUuidParam(validUuid)).not.toThrow();
      expect(validateUuidParam(validUuid)).toBe(validUuid);
    });

    it('should throw AppError for invalid UUID format', () => {
      const invalidUuid = 'not-a-uuid';
      expect(() => validateUuidParam(invalidUuid)).toThrow(AppError);
      expect(() => validateUuidParam(invalidUuid)).toThrow(/Invalid id: must be a valid UUID/);
    });

    it('should use custom parameter name in error message', () => {
      const invalidUuid = 'invalid';
      expect(() => validateUuidParam(invalidUuid, 'leadId')).toThrow(/Invalid leadId/);
    });

    it('should reject empty strings', () => {
      expect(() => validateUuidParam('')).toThrow(AppError);
    });

    it('should reject UUIDs with wrong format', () => {
      expect(() => validateUuidParam('123e4567-e89b-12d3-a456')).toThrow(AppError);
      expect(() => validateUuidParam('123e4567e89b12d3a456426614174000')).toThrow(AppError);
    });
  });

  describe('Error Response Consistency', () => {
    it('should include timestamp in all error responses', async () => {
      const responses = [
        handleNotFoundError('Lead'),
        handleConflictError('Duplicate'),
        handleBusinessLogicError('Invalid'),
        handleServerError(new Error('Test')),
        handleServiceUnavailableError(),
        handleGatewayTimeoutError(),
      ];

      for (const response of responses) {
        const body = await response.json();
        expect(body.error.timestamp).toBeDefined();
        expect(body.error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      }
    });

    it('should include error code in all error responses', async () => {
      const responses = [
        handleNotFoundError('Lead'),
        handleConflictError('Duplicate'),
        handleBusinessLogicError('Invalid'),
        handleServerError(new Error('Test')),
        handleServiceUnavailableError(),
        handleGatewayTimeoutError(),
      ];

      for (const response of responses) {
        const body = await response.json();
        expect(body.error.code).toBeDefined();
        expect(typeof body.error.code).toBe('string');
      }
    });

    it('should include message in all error responses', async () => {
      const responses = [
        handleNotFoundError('Lead'),
        handleConflictError('Duplicate'),
        handleBusinessLogicError('Invalid'),
        handleServerError(new Error('Test')),
        handleServiceUnavailableError(),
        handleGatewayTimeoutError(),
      ];

      for (const response of responses) {
        const body = await response.json();
        expect(body.error.message).toBeDefined();
        expect(typeof body.error.message).toBe('string');
        expect(body.error.message.length).toBeGreaterThan(0);
      }
    });
  });

  describe('HTTP Status Code Mapping', () => {
    it('should map authentication errors to 401', () => {
      const response = handleAuthenticationError(new AuthenticationError());
      expect(response.status).toBe(401);
    });

    it('should map authorization errors to 403', () => {
      const response = handleAuthorizationError(new AuthorizationError());
      expect(response.status).toBe(403);
    });

    it('should map validation errors to 400', () => {
      const response = handleValidationError([]);
      expect(response.status).toBe(400);
    });

    it('should map not found errors to 404', () => {
      const response = handleNotFoundError();
      expect(response.status).toBe(404);
    });

    it('should map conflict errors to 409', () => {
      const response = handleConflictError('Conflict');
      expect(response.status).toBe(409);
    });

    it('should map business logic errors to 422', () => {
      const response = handleBusinessLogicError('Invalid');
      expect(response.status).toBe(422);
    });

    it('should map server errors to 500', () => {
      const response = handleServerError(new Error());
      expect(response.status).toBe(500);
    });

    it('should map service unavailable errors to 503', () => {
      const response = handleServiceUnavailableError();
      expect(response.status).toBe(503);
    });

    it('should map gateway timeout errors to 504', () => {
      const response = handleGatewayTimeoutError();
      expect(response.status).toBe(504);
    });
  });
});
