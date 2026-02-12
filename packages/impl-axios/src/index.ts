import axios, { AxiosInstance, AxiosRequestConfig, ResponseType as AxiosResponseType } from 'axios';
import { Requestor, RequestOptions, Response, createRequestError } from '@ureq/core';

export interface AxiosRequestorOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// ResponseType 映射：将 ureq 的 responseType 转换为 axios 的 responseType
const responseTypeMap: Record<string, AxiosResponseType> = {
  json: 'json',
  text: 'text',
  blob: 'blob',
  arraybuffer: 'arraybuffer',
  formData: 'json', // axios 不直接支持 formData，回退到 json
};

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
    if (!options) return {};

    // 解构出 ureq 特有的选项，避免传递给 axios
    const { responseType, responseTransformer, ...restOptions } = options;

    const axiosResponseType = responseType
      ? responseTypeMap[responseType] || 'json'
      : undefined;

    return {
      ...restOptions,
      responseType: axiosResponseType,
    };
  }

  private async convertResponse<T>(
    response: any,
    options?: RequestOptions
  ): Promise<Response<T>> {
    let data: T;

    // 优先使用自定义转换器
    if (options?.responseTransformer) {
      data = await options.responseTransformer(response);
    } else {
      data = response.data;
    }

    return {
      data,
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
      return this.convertResponse(response, options);
    } catch (error) {
      this.handleError(error, 'GET', url);
    }
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await this.instance.post(url, data, this.convertOptions(options));
      return this.convertResponse(response, options);
    } catch (error) {
      this.handleError(error, 'POST', url);
    }
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await this.instance.put(url, data, this.convertOptions(options));
      return this.convertResponse(response, options);
    } catch (error) {
      this.handleError(error, 'PUT', url);
    }
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await this.instance.delete(url, this.convertOptions(options));
      return this.convertResponse(response, options);
    } catch (error) {
      this.handleError(error, 'DELETE', url);
    }
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<Response<T>> {
    try {
      const response = await this.instance.patch(url, data, this.convertOptions(options));
      return this.convertResponse(response, options);
    } catch (error) {
      this.handleError(error, 'PATCH', url);
    }
  }
} 