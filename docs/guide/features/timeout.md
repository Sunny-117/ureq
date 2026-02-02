# 超时控制

设置请求超时时间，避免请求长时间挂起。

## 基础用法

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(
  new FetchRequestor(),
  {
    timeout: {
      timeout: 5000  // 5 秒超时
    }
  }
);

try {
  const data = await request.get('/api/slow-endpoint');
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('请求超时');
  }
}
```

## 配置选项

### timeout

超时时间（毫秒）。

```typescript
{
  timeout: {
    timeout: 5000  // 默认值：无超时限制
  }
}
```

## 实际示例

### 示例 1：不同接口不同超时

```typescript
// 快速接口：短超时
const fastRequest = new Request(
  new FetchRequestor({ baseURL: 'https://api.example.com' }),
  { timeout: { timeout: 3000 } }
);

// 慢速接口：长超时
const slowRequest = new Request(
  new FetchRequestor({ baseURL: 'https://api.example.com' }),
  { timeout: { timeout: 30000 } }
);

// 使用不同的请求实例
const users = await fastRequest.get('/users');
const report = await slowRequest.get('/reports/generate');
```

### 示例 2：文件上传超时

```typescript
const uploadRequest = new Request(
  new FetchRequestor({
    baseURL: 'https://upload.example.com'
  }),
  {
    timeout: {
      timeout: 60000  // 60 秒超时
    },
    retry: {
      maxRetries: 2  // 超时后重试 2 次
    }
  }
);

async function uploadFile(file: File) {
  try {
    const result = await uploadRequest.post('/upload', file);
    return result;
  } catch (error) {
    if (error.message.includes('timeout')) {
      throw new Error('文件上传超时，请检查网络连接');
    }
    throw error;
  }
}
```

### 示例 3：带进度提示的超时

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    timeout: {
      timeout: 10000  // 10 秒超时
    }
  }
);

async function fetchWithProgress(url: string) {
  const timeoutWarning = setTimeout(() => {
    showNotification('请求时间较长，请稍候...');
  }, 5000);  // 5 秒后显示提示
  
  try {
    const data = await request.get(url);
    clearTimeout(timeoutWarning);
    return data;
  } catch (error) {
    clearTimeout(timeoutWarning);
    if (error.message.includes('timeout')) {
      showError('请求超时，请重试');
    }
    throw error;
  }
}
```

## 与其他功能组合

### 超时 + 重试

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    timeout: {
      timeout: 5000  // 5 秒超时
    },
    retry: {
      maxRetries: 3,  // 超时后重试 3 次
      retryDelay: 1000
    }
  }
);

// 如果请求超时，会自动重试
```

### 超时 + 并发控制

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    timeout: {
      timeout: 10000  // 单个请求 10 秒超时
    },
    parallel: {
      maxConcurrent: 5,  // 最多 5 个并发
      timeout: 60000  // 总超时 60 秒
    }
  }
);
```

## 注意事项

1. **合理设置** - 根据接口响应时间合理设置超时时间
2. **用户体验** - 超时时间不宜过长，影响用户体验
3. **网络状况** - 考虑不同网络环境下的响应时间
4. **错误处理** - 超时后要有合适的错误提示和处理

## 相关功能

- [重试功能](/guide/features/retry) - 超时后自动重试
- [并发控制](/guide/features/parallel) - 控制并发请求
