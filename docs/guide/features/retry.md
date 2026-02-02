# 重试功能

自动重试失败的请求，提高应用的可靠性。

## 基础用法

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(
  new FetchRequestor(),
  {
    retry: {
      maxRetries: 3,        // 最多重试 3 次
      retryDelay: 1000      // 每次重试间隔 1 秒
    }
  }
);

// 请求失败时会自动重试
const data = await request.get('/api/data');
```

## 配置选项

### maxRetries

最大重试次数。

```typescript
{
  retry: {
    maxRetries: 3  // 默认值：3
  }
}
```

### retryDelay

重试延迟时间（毫秒）。

```typescript
{
  retry: {
    retryDelay: 1000  // 默认值：1000ms (1秒)
  }
}
```

### shouldRetry

自定义重试条件。

```typescript
import { RequestError } from '@ureq/core';

{
  retry: {
    shouldRetry: (error: RequestError) => {
      // 只重试 5xx 错误
      return error.status >= 500 && error.status < 600;
    }
  }
}
```

## 默认重试策略

默认情况下，以下错误会触发重试：

- **网络错误** - 无法连接到服务器
- **超时错误** - 请求超时
- **5xx 错误** - 服务器内部错误
- **429 错误** - 请求过多（Rate Limit）

以下错误不会重试：

- **4xx 错误**（除 429）- 客户端错误
- **自定义错误** - 业务逻辑错误

## 高级用法

### 指数退避

实现指数退避重试策略：

```typescript
let retryCount = 0;

const request = new Request(
  new FetchRequestor(),
  {
    retry: {
      maxRetries: 5,
      retryDelay: 1000,
      shouldRetry: (error) => {
        if (error.status >= 500) {
          retryCount++;
          // 指数退避：1s, 2s, 4s, 8s, 16s
          const delay = Math.pow(2, retryCount - 1) * 1000;
          return new Promise(resolve => {
            setTimeout(() => resolve(true), delay);
          });
        }
        return false;
      }
    }
  }
);
```

### 根据错误类型重试

```typescript
{
  retry: {
    shouldRetry: (error) => {
      // 网络错误：重试 3 次
      if (error.message.includes('network')) {
        return error.retryCount < 3;
      }
      
      // 超时错误：重试 2 次
      if (error.message.includes('timeout')) {
        return error.retryCount < 2;
      }
      
      // 服务器错误：重试 5 次
      if (error.status >= 500) {
        return error.retryCount < 5;
      }
      
      return false;
    }
  }
}
```

### 重试回调

在重试时执行自定义逻辑：

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    retry: {
      maxRetries: 3,
      shouldRetry: async (error) => {
        console.log(`Retry attempt ${error.retryCount + 1}`);
        
        // 记录重试日志
        await logRetry({
          url: error.config.url,
          attempt: error.retryCount + 1,
          error: error.message
        });
        
        return error.retryCount < 3;
      }
    }
  }
);
```

## 实际示例

### 示例 1：API 请求重试

```typescript
const apiRequest = new Request(
  new FetchRequestor({
    baseURL: 'https://api.example.com'
  }),
  {
    retry: {
      maxRetries: 3,
      retryDelay: 2000,
      shouldRetry: (error) => {
        // 只重试服务器错误和网络错误
        return error.status >= 500 || error.message.includes('network');
      }
    }
  }
);

try {
  const data = await apiRequest.get('/users');
  console.log('Success:', data);
} catch (error) {
  console.error('Failed after retries:', error);
}
```

### 示例 2：文件上传重试

```typescript
const uploadRequest = new Request(
  new FetchRequestor({
    baseURL: 'https://upload.example.com'
  }),
  {
    retry: {
      maxRetries: 5,
      retryDelay: 3000,
      shouldRetry: (error) => {
        // 上传失败时重试
        if (error.status === 503 || error.status === 504) {
          console.log(`Upload failed, retrying... (${error.retryCount + 1}/5)`);
          return true;
        }
        return false;
      }
    },
    timeout: {
      timeout: 30000  // 30 秒超时
    }
  }
);

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const result = await uploadRequest.post('/upload', formData);
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Upload failed after retries:', error);
  }
}
```

### 示例 3：带进度提示的重试

```typescript
import { RequestError } from '@ureq/core';

const request = new Request(
  new FetchRequestor(),
  {
    retry: {
      maxRetries: 3,
      retryDelay: 1000,
      shouldRetry: (error: RequestError) => {
        if (error.retryCount < 3) {
          // 显示重试提示
          showNotification({
            type: 'warning',
            message: `请求失败，正在重试... (${error.retryCount + 1}/3)`
          });
          return true;
        }
        return false;
      }
    }
  }
);
```

## 注意事项

1. **幂等性** - 确保重试的请求是幂等的，避免重复操作
2. **重试次数** - 不要设置过多的重试次数，避免长时间等待
3. **重试延迟** - 合理设置延迟时间，避免对服务器造成压力
4. **错误处理** - 即使有重试，也要处理最终失败的情况

## 相关功能

- [超时控制](/guide/features/timeout) - 配合超时使用
- [幂等性保证](/guide/features/idempotent) - 避免重复请求
- [错误处理](/guide/advanced/error-handling) - 处理重试失败
