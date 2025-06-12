export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryCondition?: (error: any) => boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryCondition: (error) => {
    // Retry on network errors, 5xx errors, or timeout errors
    return (
      !error.response ||
      error.response.status >= 500 ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT_ERROR'
    );
  }
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === opts.maxRetries || !opts.retryCondition?.(error)) {
        throw error;
      }

      const delay = Math.min(
        opts.baseDelay * Math.pow(2, attempt),
        opts.maxDelay
      );
      
      console.warn(`Operation failed (attempt ${attempt + 1}/${opts.maxRetries + 1}), retrying in ${delay}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export function handleError(error: any, context: string): ApiError {
  console.error(`Error in ${context}:`, error);
  
  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError(
    'An unexpected error occurred',
    500,
    'UNKNOWN_ERROR',
    error
  );
}
