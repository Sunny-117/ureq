# 请求缓存

@ureq 支持灵活的请求缓存配置。

## 基础用法

```typescript
const request = new Request(new FetchRequestor(), {
  cache: {
    ttl: 60000, // 缓存1分钟
    store: new MemoryStore()
  }
});
```

## 自定义缓存键

```typescript
const request = new Request(new FetchRequestor(), {
  cache: {
    getCacheKey: (url, options) => {
      return `${options?.method}-${url}`;
    }
  }
});
``` 