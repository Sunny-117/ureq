import { 
  RequestError, 
  UreqError, 
  NetworkError, 
  TimeoutError, 
  AbortError, 
  HttpError 
} from '../interfaces/request.js';

export interface ErrorContext {
  url?: string;
  method?: string;
  retryCount?: number;
  requestId?: string;
}

/**
 * Creates appropriate error types based on the error context
 */
export function createRequestError(
  error: any, 
  context: ErrorContext = {}
): RequestError {
  const { url, method, retryCount } = context;
  
  // Handle AbortController signals
  if (error.name === 'AbortError' || error.code === 'ABORT_ERR') {
    return new AbortError('Request was aborted', {
      url,
      method,
      retryCount,
      code: 'ABORT_ERR'
    });
  }
  
  // Handle timeout errors
  if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
    return new TimeoutError('Request timed out', {
      url,
      method,
      retryCount,
      code: 'TIMEOUT'
    });
  }
  
  // Handle network errors
  if (error.name === 'TypeError' && error.message?.includes('fetch')) {
    return new NetworkError('Network request failed', {
      url,
      method,
      retryCount,
      code: 'NETWORK_ERROR'
    });
  }
  
  // Handle HTTP errors (Response objects)
  if (error instanceof globalThis.Response) {
    return new HttpError(
      `HTTP ${error.status}: ${error.statusText}`,
      error.status,
      {
        url,
        method,
        retryCount,
        code: `HTTP_${error.status}`,
        data: error
      }
    );
  }
  
  // Handle Axios errors
  if (error.response) {
    return new HttpError(
      `HTTP ${error.response.status}: ${error.response.statusText || 'Unknown Error'}`,
      error.response.status,
      {
        url: url || error.config?.url,
        method: method || error.config?.method?.toUpperCase(),
        retryCount,
        code: `HTTP_${error.response.status}`,
        data: error.response.data
      }
    );
  }
  
  // Handle Axios network errors
  if (error.request && !error.response) {
    return new NetworkError('Network request failed', {
      url: url || error.config?.url,
      method: method || error.config?.method?.toUpperCase(),
      retryCount,
      code: 'NETWORK_ERROR'
    });
  }
  
  // Handle already processed UreqError
  if (error instanceof UreqError) {
    // Update context if provided
    if (url && !error.url) error.url = url;
    if (method && !error.method) error.method = method;
    if (retryCount !== undefined) error.retryCount = retryCount;
    return error;
  }
  
  // Generic error fallback
  return new UreqError(error.message || 'Unknown error occurred', {
    url,
    method,
    retryCount,
    code: 'UNKNOWN_ERROR'
  });
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: RequestError): boolean {
  // Don't retry client errors (4xx) except for specific cases
  if (error.status && error.status >= 400 && error.status < 500) {
    // Retry on 408 (Request Timeout), 429 (Too Many Requests)
    return error.status === 408 || error.status === 429;
  }
  
  // Retry on server errors (5xx)
  if (error.status && error.status >= 500) {
    return true;
  }
  
  // Retry on network errors and timeouts
  if (error.isNetworkError || error.isTimeout) {
    return true;
  }
  
  // Don't retry aborted requests
  if (error.isAborted) {
    return false;
  }
  
  // Default to retryable for unknown errors
  return true;
}

/**
 * Formats error for logging
 */
export function formatError(error: RequestError): string {
  const parts = [
    `[${error.name}]`,
    error.message
  ];
  
  if (error.method && error.url) {
    parts.push(`(${error.method} ${error.url})`);
  }
  
  if (error.status) {
    parts.push(`Status: ${error.status}`);
  }
  
  if (error.retryCount !== undefined) {
    parts.push(`Retry: ${error.retryCount}`);
  }
  
  return parts.join(' ');
}

/**
 * Extracts error details for debugging
 */
export function getErrorDetails(error: RequestError): Record<string, any> {
  return {
    name: error.name,
    message: error.message,
    status: error.status,
    code: error.code,
    url: error.url,
    method: error.method,
    timestamp: error.timestamp,
    retryCount: error.retryCount,
    isTimeout: error.isTimeout,
    isNetworkError: error.isNetworkError,
    isAborted: error.isAborted,
    stack: error.stack
  };
}
