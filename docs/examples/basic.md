# 基础示例

## GET 请求

```typescript
const request = new Request(new FetchRequestor());

// 简单的 GET 请求
const data = await request.get('/api/data');

// 带查询参数的 GET 请求
const result = await request.get('/api/search', {
  params: {
    q: 'keyword',
    page: 1
  }
});
```

## POST 请求

```typescript
// 发送 JSON 数据
const created = await request.post('/api/users', {
  name: 'John',
  email: 'john@example.com'
});

// 发送表单数据
const formData = new FormData();
formData.append('file', file);
const uploaded = await request.post('/api/upload', formData);
``` 