import { RequestError, RequestOptions, Response } from "./interfaces/request";

export interface RequestInterceptor {
  onRequest?(config: RequestOptions): Promise<RequestOptions> | RequestOptions;
  onRequestError?(error: any): Promise<any>;
}

export interface ResponseInterceptor {
  onResponse?<T>(response: Response<T>): Promise<Response<T>> | Response<T>;
  onResponseError?(error: RequestError): Promise<any>;
}

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index !== -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index !== -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  async runRequestInterceptors(config: RequestOptions): Promise<RequestOptions> {
    let currentConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      if (interceptor.onRequest) {
        currentConfig = await interceptor.onRequest(currentConfig);
      }
    }
    return currentConfig;
  }

  async runResponseInterceptors<T>(response: Response<T>): Promise<Response<T>> {
    let currentResponse = { ...response };
    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onResponse) {
        currentResponse = await interceptor.onResponse(currentResponse);
      }
    }
    return currentResponse;
  }
} 