# 错误处理

完善的错误处理机制，便于调试和监控。

## RequestError 类型

@ureq 提供了 `RequestError` 类型来表示请求错误：

```typescript
interface RequestError extends Error {
  status?: number;
  statusText?: string;
  response?: any;
  config?: RequestOptions;
  retryCount?: number;
}
```

## 基础错误处理

### Try-Catch

```typescript
import { Request, RequestError } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(new FetchRequestor());

try {
  const data = await request.get('/api/users');
  console.log(data);
} catch (error) {
  console.error('Request failed:', error);
}
```

### 类型检查

```typescript
try {
  const data = await request.get('/api/users');
} catch (error) {
  if (error instanceof RequestError) {
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Response:', error.response);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## 根据状态码处理

### 基础状态码处理

```typescript
try {
  const data = await request.get('/api/users');
} catch (error) {
  if (error instanceof RequestError) {
    switch (error.status) {
      case 400:
        console.error('请求参数错误');
        break;
      case 401:
        console.error('未授权，请登录');
        window.location.href = '/login';
        break;
      case 403:
        console.error('无权限访问');
        break;
      case 404:
        console.error('资源不存在');
        break;
      case 500:
        console.error('服务器错误');
        break;
      default:
        console.error('请求失败:', error.message);
    }
  }
}
```

### 错误处理函数

```typescript
function handleRequestError(error: unknown) {
  if (!(error instanceof RequestError)) {
    console.error('Unknown error:', error);
    return;
  }

  const { status, message, response } = error;

  // 客户端错误 (4xx)
  if (status && status >= 400 && status < 500) {
    switch (status) {
      case 400:
        showError('请求参数错误', response?.message);
        break;
      case 401:
        showError('请先登录');
        redirectToLogin();
        break;
      case 403:
        showError('您没有权限访问此资源');
        break;
      case 404:
        showError('请求的资源不存在');
        break;
      case 422:
        showError('数据验证失败', response?.errors);
        break;
      default:
        showError('请求失败', message);
    }
  }
  // 服务器错误 (5xx)
  else if (status && status >= 500) {
    showError('服务器错误，请稍后重试');
    logError(error); // 记录到日志系统
  }
  // 网络错误
  else {
    showError('网络连接失败，请检查网络');
  }
}

// 使用
try {
  const data = await request.get('/api/users');
} catch (error) {
  handleRequestError(error);
}
```

## 使用拦截器统一处理

### 全局错误处理

```typescript
request.interceptors.addResponseInterceptor({
  onResponseError: (error) => {
    if (error.status === 401) {
      // 未授权：清除 token 并跳转登录
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.status === 403) {
      // 无权限：显示提示
      showNotification({
        type: 'error',
        message: '您没有权限访问此资源'
      });
    } else if (error.status >= 500) {
      // 服务器错误：显示通用错误
      showNotification({
        type: 'error',
        message: '服务器错误，请稍后重试'
      });
    }
    
    // 继续抛出错误，让调用方处理
    throw error;
  }
});
```

### 业务错误处理

```typescript
// 假设 API 返回格式：{ code: number, data: any, message: string }
request.interceptors.addResponseInterceptor({
  onResponse: (response) => {
    const { code, data, message } = response.data;
    
    if (code === 0) {
      // 成功：返回数据
      return {
        ...response,
        data
      };
    } else {
      // 业务错误：抛出错误
      const error = new Error(message) as RequestError;
      error.status = response.status;
      error.response = response.data;
      throw error;
    }
  }
});
```

## 错误重试

### 自动重试

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    retry: {
      maxRetries: 3,
      retryDelay: 1000,
      shouldRetry: (error) => {
        // 只重试网络错误和 5xx 错误
        return !error.status || error.status >= 500;
      }
    }
  }
);

try {
  const data = await request.get('/api/users');
} catch (error) {
  // 重试 3 次后仍然失败
  console.error('Failed after retries:', error);
}
```

### 手动重试

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw lastError!;
}

// 使用
try {
  const data = await fetchWithRetry(() => request.get('/api/users'));
} catch (error) {
  console.error('All retries failed:', error);
}
```

## 错误日志

### 记录错误

```typescript
function logError(error: RequestError) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    url: error.config?.url,
    method: error.config?.method,
    status: error.status,
    message: error.message,
    response: error.response,
    retryCount: error.retryCount
  };
  
  // 发送到日志服务
  console.error('Error Log:', errorLog);
  
  // 可以发送到 Sentry、LogRocket 等服务
  // Sentry.captureException(error);
}

request.interceptors.addResponseInterceptor({
  onResponseError: (error) => {
    logError(error);
    throw error;
  }
});
```

### 错误监控

```typescript
class ErrorMonitor {
  private errors: RequestError[] = [];
  
  record(error: RequestError) {
    this.errors.push(error);
    
    // 错误率过高时告警
    if (this.getErrorRate() > 0.5) {
      this.alert('Error rate is too high!');
    }
  }
  
  getErrorRate(): number {
    const recentErrors = this.errors.filter(
      e => Date.now() - new Date(e.config?.timestamp || 0).getTime() < 60000
    );
    return recentErrors.length / 100; // 假设每分钟 100 个请求
  }
  
  alert(message: string) {
    console.error('ALERT:', message);
    // 发送告警通知
  }
}

const monitor = new ErrorMonitor();

request.interceptors.addResponseInterceptor({
  onResponseError: (error) => {
    monitor.record(error);
    throw error;
  }
});
```

## 用户友好的错误提示

### 错误消息映射

```typescript
const errorMessages: Record<number, string> = {
  400: '请求参数有误，请检查后重试',
  401: '登录已过期，请重新登录',
  403: '您没有权限执行此操作',
  404: '请求的资源不存在',
  422: '提交的数据验证失败',
  429: '请求过于频繁，请稍后再试',
  500: '服务器出错了，请稍后重试',
  502: '网关错误，请稍后重试',
  503: '服务暂时不可用，请稍后重试',
  504: '请求超时，请稍后重试'
};

function getUserFriendlyMessage(error: RequestError): string {
  if (error.status && errorMessages[error.status]) {
    return errorMessages[error.status];
  }
  
  if (!error.status) {
    return '网络连接失败，请检查网络设置';
  }
  
  return error.message || '请求失败，请稍后重试';
}

// 使用
try {
  const data = await request.get('/api/users');
} catch (error) {
  const message = getUserFriendlyMessage(error as RequestError);
  showNotification({ type: 'error', message });
}
```

## 完整示例

```typescript
import { Request, RequestError } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

// 创建请求实例
const request = new Request(
  new FetchRequestor({
    baseURL: 'https://jsonplaceholder.typicode.com/todos/1'
  }),
  {
    retry: {
      maxRetries: 3,
      shouldRetry: (error) => error.status >= 500
    }
  }
);

// 全局错误处理
request.interceptors.addResponseInterceptor({
  onResponseError: (error) => {
    // 记录错误
    console.error('[Error]', {
      url: error.config?.url,
      status: error.status,
      message: error.message
    });
    
    // 根据状态码处理
    if (error.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.status === 403) {
      showNotification({
        type: 'error',
        message: '您没有权限访问此资源'
      });
    } else if (error.status >= 500) {
      showNotification({
        type: 'error',
        message: '服务器错误，请稍后重试'
      });
    }
    
    throw error;
  }
});

// 使用
async function fetchUsers() {
  try {
    const users = await request.get('/users');
    return users;
  } catch (error) {
    if (error instanceof RequestError) {
      // 特定错误处理
      if (error.status === 404) {
        console.log('No users found');
        return [];
      }
    }
    throw error;
  }
}
```

## 注意事项

1. **错误传播** - 在拦截器中处理错误后要继续 throw，让调用方也能处理
2. **用户体验** - 提供友好的错误提示，避免技术术语
3. **错误日志** - 记录详细的错误信息，便于排查问题
4. **重试策略** - 合理设置重试条件，避免无意义的重试

## 相关

- [拦截器](/guide/advanced/interceptors)
- [重试功能](/guide/features/retry)
- [Request API](/api/core/request)
