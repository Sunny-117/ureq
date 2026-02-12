import { Requestor, RequestOptions, Response, ResponseType, createRequestError } from '@ureq/core';

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

  private async parseResponseByType<T>(
    response: globalThis.Response,
    responseType: ResponseType = 'json'
  ): Promise<T> {
    switch (responseType) {
      case 'text':
        return (await response.text()) as T;
      case 'blob':
        return (await response.blob()) as T;
      case 'arraybuffer':
        return (await response.arrayBuffer()) as T;
      case 'formData':
        return (await response.formData()) as T;
      case 'json':
      default:
        // 先读取为 text，再尝试解析为 JSON，兼容返回非 JSON 的情况
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          return text as T;
        }
    }
  }

  private async convertResponse<T>(
    response: globalThis.Response,
    options?: RequestOptions
  ): Promise<Response<T>> {
    let data: T;

    // 优先使用自定义转换器
    if (options?.responseTransformer) {
      data = await options.responseTransformer(response);
    } else {
      data = await this.parseResponseByType<T>(response, options?.responseType);
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
    // 解构出需要特殊处理的选项
    const { headers: optionHeaders, responseType, responseTransformer, ...restOptions } = options || {};

    return {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...optionHeaders,
      },
      body: data ? JSON.stringify(data) : undefined,
      signal: options?.signal,
      credentials: 'same-origin',
      ...restOptions,
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

      return this.convertResponse(response, options);
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

      return this.convertResponse(response, options);
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

      return this.convertResponse(response, options);
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

      return this.convertResponse(response, options);
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

      return this.convertResponse(response, options);
    } catch (error) {
      this.handleError(error, 'PATCH', url);
    }
  }
} 