import { Requestor, RequestOptions, Response, RequestError, createRequestError } from '@ureq/core';

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

  private handleError(error: any, method?: string, url?: string): never {
    throw createRequestError(error, { method, url });
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
      const fullUrl = this.getFullURL(url);
      const response = await fetch(
        fullUrl,
        this.createRequestInit('GET', undefined, options)
      );

      if (!response.ok) {
        throw response;
      }

      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error, 'GET', url);
    }
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const fullUrl = this.getFullURL(url);
      const response = await fetch(
        fullUrl,
        this.createRequestInit('POST', data, options)
      );

      if (!response.ok) {
        throw response;
      }

      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error, 'POST', url);
    }
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const fullUrl = this.getFullURL(url);
      const response = await fetch(
        fullUrl,
        this.createRequestInit('PUT', data, options)
      );

      if (!response.ok) {
        throw response;
      }

      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error, 'PUT', url);
    }
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    try {
      const fullUrl = this.getFullURL(url);
      const response = await fetch(
        fullUrl,
        this.createRequestInit('DELETE', undefined, options)
      );

      if (!response.ok) {
        throw response;
      }

      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error, 'DELETE', url);
    }
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const fullUrl = this.getFullURL(url);
      const response = await fetch(
        fullUrl,
        this.createRequestInit('PATCH', data, options)
      );

      if (!response.ok) {
        throw response;
      }

      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error, 'PATCH', url);
    }
  }

  // 实现其他方法...
} 