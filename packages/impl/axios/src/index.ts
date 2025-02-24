import axios, { AxiosInstance, AxiosRequestConfig, ResponseType } from 'axios';
import { Requestor, RequestOptions, Response, RequestError } from '@request/core';

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

  private handleError(error: any): never {
    const requestError: RequestError = new Error(error.message);
    requestError.status = error.response?.status;
    requestError.code = error.code;
    requestError.data = error.response?.data;
    throw requestError;
  }

  async get<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await this.instance.get(url, this.convertOptions(options));
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await this.instance.post(url, data, this.convertOptions(options));
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await this.instance.put(url, data, this.convertOptions(options));
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await this.instance.delete(url, this.convertOptions(options));
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await this.instance.patch(url, data, this.convertOptions(options));
      return this.convertResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }
} 