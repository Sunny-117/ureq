# Retry API

重试功能的 API 参考。

## RetryOptions

```typescript
interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  shouldRetry?: (error: RequestError) => boolean | Promise<boolean>;
}
```

### maxRetries

最大重试次数。

- **类型**: `number`
- **默认值**: `3`

### retryDelay

重试延迟时间（毫秒）。

- **类型**: `number`
- **默认值**: `1000`

### shouldRetry

自定义重试条件函数。

- **类型**: `(error: RequestError) => boolean | Promise<boolean>`
- **默认值**: 重试网络错误和 5xx 错误

## 使用示例

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    retry: {
      maxRetries: 3,
      retryDelay: 1000,
      shouldRetry: (error) => {
        return error.status >= 500;
      }
    }
  }
);
```

## 相关

- [重试功能指南](/guide/features/retry)
- [重试示例](/examples/retry)
