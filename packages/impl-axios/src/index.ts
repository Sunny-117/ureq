import axios, { AxiosInstance, AxiosRequestConfig, ResponseType } from 'axios';
import { Requestor, RequestOptions, Response, createRequestError } from '@ureq/core';

export interface AxiosRequestorOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class AxiosRequestor implements Requestor {
  private instance: AxiosInstance;

  constructor(options?: AxiosRequestorOptions) {
    this.instance = axios.create({
      baseURL: options?.baseURL,
      timeout: options?.timeout,
      headers: options?.headers,
    });
  }

  private convertOptions(options?: RequestOptions): AxiosRequestConfig {
    return {
      headers: options?.headers,
      signal: options?.signal,
      responseType: options?.responseType as ResponseType | undefined,
      ...options,
    };
  }

  private convertResponse<T>(response: any): Response<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  private handleError(error: any, method?: string, url?: string): never {
    throw createRequestError(error, { method, url });
  }

  async get<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await this.instance.get(url, this.convertOptions(options));
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error, 'GET', url);
    }
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await this.instance.post(url, data, this.convertOptions(options));
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error, 'POST', url);
    }
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await this.instance.put(url, data, this.convertOptions(options));
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error, 'PUT', url);
    }
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await this.instance.delete(url, this.convertOptions(options));
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error, 'DELETE', url);
    }
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await this.instance.patch(url, data, this.convertOptions(options));
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error, 'PATCH', url);
    }
  }
} 