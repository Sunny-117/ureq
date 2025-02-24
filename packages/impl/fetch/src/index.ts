import { Requestor, RequestOptions, Response, RequestError } from '@request/core';

export interface FetchRequestorOptions {
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
}

export class FetchRequestor implements Requestor {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(options?: FetchRequestorOptions) {
    this.baseURL = options?.baseURL || '';
    this.defaultHeaders = options?.defaultHeaders || {};
  }

  private getFullURL(url: string): string {
    return this.baseURL ? new URL(url, this.baseURL).toString() : url;
  }

  private async convertResponse<T>(response: globalThis.Response): Promise<Response<T>> {
    let data: T;
    
    try {
      data = await response.json();
    } catch {
      data = await response.text() as any;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    };
  }

  private handleError(error: any): never {
    const requestError: RequestError = new Error(error.message);
    if (error instanceof globalThis.Response) {
      requestError.status = error.status;
    }
    throw requestError;
  }

  private createRequestInit(
    method: string,
    data?: any,
    options?: RequestOptions
  ): RequestInit {
    return {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      signal: options?.signal,
      credentials: 'same-origin',
      ...options,
    };
  }

  async get<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await fetch(
        this.getFullURL(url),
        this.createRequestInit('GET', undefined, options)
      );
      
      if (!response.ok) {
        throw response;
      }
      
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await fetch(
        this.getFullURL(url),
        this.createRequestInit('POST', data, options)
      );
      
      if (!response.ok) {
        throw response;
      }
      
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await fetch(
        this.getFullURL(url),
        this.createRequestInit('PUT', data, options)
      );
      
      if (!response.ok) {
        throw response;
      }
      
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await fetch(
        this.getFullURL(url),
        this.createRequestInit('DELETE', undefined, options)
      );
      
      if (!response.ok) {
        throw response;
      }
      
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await fetch(
        this.getFullURL(url),
        this.createRequestInit('PATCH', data, options)
      );
      
      if (!response.ok) {
        throw response;
      }
      
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // 实现其他方法...
} 