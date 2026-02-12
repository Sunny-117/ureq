# @ureq/impl-axios

基于 Axios 的请求器实现。

## 安装

```bash
npm install @ureq/core @ureq/impl-axios axios
# 或
pnpm add @ureq/core @ureq/impl-axios axios
```

> 注意：需要同时安装 `axios` 依赖

## 使用

```typescript
import { Request } from '@ureq/core';
import { AxiosRequestor } from '@ureq/impl-axios';

const request = new Request(new AxiosRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
}));

// 发起请求
const users = await request.get('/users');
```

## 配置选项

```typescript
interface AxiosRequestorConfig {
  baseURL?: string;        // API 基础 URL
  headers?: Record<string, string>;  // 默认请求头
  timeout?: number;        // 超时时间（毫秒）
  withCredentials?: boolean;  // 跨域请求是否携带凭证
  // 其他 Axios 配置...
}
```

## 特性

- ✅ 功能丰富
- ✅ 广泛的浏览器支持
- ✅ 自动转换 JSON 数据
- ✅ 请求和响应拦截器
- ✅ 取消请求支持
- ✅ 进度监控

## 浏览器兼容性

- Chrome
- Firefox
- Safari
- Edge
- IE 11+
- Node.js

## 何时使用

选择 AxiosRequestor 当你需要：

- 支持旧版本浏览器（IE 11+）
- 更多的配置选项
- 上传/下载进度监控
- 请求取消功能

## 示例

### 基础用法

```typescript
const requestor = new AxiosRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1'
});

const request = new Request(requestor);
const data = await request.get('/users');
```

### 带认证

```typescript
const requestor = new AxiosRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1',
  headers: {
    'Authorization': 'Bearer your-token'
  }
});
```

### 跨域请求

```typescript
const requestor = new AxiosRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1',
  withCredentials: true  // 携带 Cookie
});
```

## 文档

查看完整文档：[https://sunny-117.github.io/ureq](https://sunny-117.github.io/ureq)

## License

MIT
