# Request

核心请求类,用于创建请求实例。

## 构造函数

```typescript
constructor(requestor: Requestor, config?: RequestConfig)
```

### 参数

- `requestor`: 请求器实现
- `config`: 配置选项
  - `timeout`: 超时时间
  - `retry`: 重试配置
  - `cache`: 缓存配置
  - `parallel`: 并发配置
  - `idempotent`: 幂等性配置

## 方法

### get

```typescript
get<T>(url: string, options?: RequestOptions): Promise<T>
```

### post

```typescript
post<T>(url: string, data?: any, options?: RequestOptions): Promise<T>
``` 