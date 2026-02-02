# Timeout API

超时控制功能的 API 参考。

## TimeoutOptions

```typescript
interface TimeoutOptions {
  timeout?: number;
}
```

### timeout

请求超时时间（毫秒）。

- **类型**: `number`
- **默认值**: 无超时限制

## 使用示例

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    timeout: {
      timeout: 5000  // 5 秒超时
    }
  }
);
```

## 相关

- [超时控制指南](/guide/features/timeout)
