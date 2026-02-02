# 重试示例

## 基础重试

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(
  new FetchRequestor(),
  {
    retry: {
      maxRetries: 3,
      retryDelay: 1000
    }
  }
);

const data = await request.get('/api/users');
```

## 自定义重试条件

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    retry: {
      maxRetries: 3,
      shouldRetry: (error) => {
        // 只重试 5xx 错误
        return error.status >= 500 && error.status < 600;
      }
    }
  }
);
```

## 指数退避

```typescript
let retryCount = 0;

const request = new Request(
  new FetchRequestor(),
  {
    retry: {
      maxRetries: 5,
      shouldRetry: (error) => {
        if (error.status >= 500) {
          retryCount++;
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

## 相关

- [重试功能](/guide/features/retry)
- [超时控制](/guide/features/timeout)
