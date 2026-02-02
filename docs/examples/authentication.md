# 认证授权示例

完整的认证授权实现。

## JWT 认证

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(
  new FetchRequestor({
    baseURL: 'https://api.example.com'
  })
);

// 添加 Token 拦截器
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    return config;
  }
});

// 登录
async function login(email: string, password: string) {
  try {
    const { token, refreshToken, user } = await request.post('/auth/login', {
      email,
      password
    });
    
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// 登出
async function logout() {
  try {
    await request.post('/auth/logout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}
```

## 自动刷新 Token

```typescript
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token');
  }
  
  const { token } = await request.post('/auth/refresh', {
    refreshToken
  });
  
  localStorage.setItem('token', token);
  return token;
}

request.interceptors.addResponseInterceptor({
  onResponseError: async (error) => {
    const originalRequest = error.config;
    
    if (error.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果正在刷新，将请求加入队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return request.request(
            originalRequest.method,
            originalRequest.url,
            originalRequest.data,
            originalRequest
          );
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const token = await refreshToken();
        
        // 处理队列中的请求
        failedQueue.forEach(({ resolve }) => resolve(token));
        failedQueue = [];
        
        // 重试原请求
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return request.request(
          originalRequest.method,
          originalRequest.url,
          originalRequest.data,
          originalRequest
        );
      } catch (refreshError) {
        // 刷新失败，清除 token 并跳转登录
        failedQueue.forEach(({ reject }) => reject(refreshError));
        failedQueue = [];
        
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }
    
    throw error;
  }
});
```

## OAuth 2.0

```typescript
// 获取授权 URL
function getAuthorizationUrl() {
  const params = new URLSearchParams({
    client_id: 'your-client-id',
    redirect_uri: 'http://localhost:3000/callback',
    response_type: 'code',
    scope: 'read write'
  });
  
  return `https://oauth.example.com/authorize?${params}`;
}

// 处理回调
async function handleCallback(code: string) {
  try {
    const { access_token, refresh_token } = await request.post('/auth/token', {
      grant_type: 'authorization_code',
      code,
      client_id: 'your-client-id',
      client_secret: 'your-client-secret',
      redirect_uri: 'http://localhost:3000/callback'
    });
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    
    window.location.href = '/';
  } catch (error) {
    console.error('OAuth callback failed:', error);
    throw error;
  }
}
```

## API Key 认证

```typescript
const request = new Request(
  new FetchRequestor({
    baseURL: 'https://api.example.com',
    headers: {
      'X-API-Key': 'your-api-key'
    }
  })
);
```

## Basic 认证

```typescript
function getBasicAuthHeader(username: string, password: string) {
  const credentials = btoa(`${username}:${password}`);
  return `Basic ${credentials}`;
}

request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    const username = 'user';
    const password = 'pass';
    
    config.headers = {
      ...config.headers,
      'Authorization': getBasicAuthHeader(username, password)
    };
    
    return config;
  }
});
```

## 完整示例

```typescript
class AuthService {
  private request: Request;
  
  constructor() {
    this.request = new Request(
      new FetchRequestor({
        baseURL: 'https://api.example.com'
      })
    );
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // 添加 Token
    this.request.interceptors.addRequestInterceptor({
      onRequest: (config) => {
        const token = this.getToken();
        if (token) {
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`
          };
        }
        return config;
      }
    });
    
    // 处理 401
    this.request.interceptors.addResponseInterceptor({
      onResponseError: async (error) => {
        if (error.status === 401) {
          try {
            await this.refreshToken();
            return this.request.request(
              error.config.method,
              error.config.url,
              error.config.data,
              error.config
            );
          } catch (refreshError) {
            this.logout();
            throw refreshError;
          }
        }
        throw error;
      }
    });
  }
  
  async login(email: string, password: string) {
    const { token, refreshToken, user } = await this.request.post('/auth/login', {
      email,
      password
    });
    
    this.setToken(token);
    this.setRefreshToken(refreshToken);
    
    return user;
  }
  
  async logout() {
    try {
      await this.request.post('/auth/logout');
    } finally {
      this.clearTokens();
      window.location.href = '/login';
    }
  }
  
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    
    const { token } = await this.request.post('/auth/refresh', {
      refreshToken
    });
    
    this.setToken(token);
    return token;
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  setToken(token: string) {
    localStorage.setItem('token', token);
  }
  
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
  
  setRefreshToken(token: string) {
    localStorage.setItem('refreshToken', token);
  }
  
  clearTokens() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// 使用
const auth = new AuthService();

// 登录
await auth.login('user@example.com', 'password');

// 检查认证状态
if (auth.isAuthenticated()) {
  console.log('User is authenticated');
}

// 登出
await auth.logout();
```

## 相关

- [拦截器](/guide/advanced/interceptors)
- [错误处理](/guide/advanced/error-handling)
- [拦截器示例](/examples/interceptors)
