# Idempotent API

幂等性保证功能的 API 参考。

## IdempotentOptions

```typescript
interface IdempotentOptions {
  dedupeTime?: number;
  getRequestId?: (method: string, url: string, data?: any, options?: RequestOptions) => string;
  hashService?: HashService;
}
```

### dedupeTime

请求去重的时间窗口（毫秒）。

- **类型**: `number`
- **默认值**: `1000` (1 秒)

### getRequestId

自定义请求标识生成函数。

- **类型**: `(method: string, url: string, data?: any, options?: RequestOptions) => string`

### hashService

Hash 服务实现。

- **类型**: `HashService`
- **默认值**: `DefaultHashService`

## 使用示例

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    idempotent: {
      dedupeTime: 2000,
      getRequestId: (method, url, data, options) => {
        return `${method}:${url}`;
      }
    }
  }
);
```

## 相关

- [幂等性保证指南](/guide/features/idempotent)
