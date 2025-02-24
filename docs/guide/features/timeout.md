# 超时处理

@ureq 提供了灵活的超时控制功能。

## 基础用法

```typescript
const request = new Request(new FetchRequestor(), {
  timeout: 5000 // 5秒超时
});
```

## 单次请求超时

```typescript
const data = await request.get('/api/data', {
  timeout: 3000 // 这次请求3秒超时
});
``` 