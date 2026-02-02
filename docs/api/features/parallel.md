# Parallel API

并发控制功能的 API 参考。

## ParallelOptions

```typescript
interface ParallelOptions {
  maxConcurrent?: number;
  timeout?: number;
}
```

### maxConcurrent

最大并发请求数。

- **类型**: `number`
- **默认值**: `5`

### timeout

并发请求的总超时时间（毫秒）。

- **类型**: `number`
- **默认值**: `30000` (30 秒)

## 使用示例

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    parallel: {
      maxConcurrent: 10,
      timeout: 60000
    }
  }
);
```

## 相关

- [并发控制指南](/guide/features/parallel)
