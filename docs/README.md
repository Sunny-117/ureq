# @ureq 文档

欢迎来到 @ureq 文档！

## 📚 文档结构

### 指南 (Guide)

- **介绍** - 了解 @ureq 的设计理念和核心特性
- **快速开始** - 5 分钟上手 @ureq
- **核心功能**
  - 智能重试 - 自动重试失败的请求
  - 请求缓存 - 减少不必要的网络请求
  - 并发控制 - 限制同时进行的请求数量
  - 幂等性保证 - 自动去重相同的请求
  - 超时控制 - 避免请求长时间挂起
- **进阶指南**
  - 拦截器 - 请求和响应拦截
  - 自定义请求器 - 实现自己的 HTTP 客户端
  - 错误处理 - 完善的错误处理机制

### API 文档 (API)

- **核心 API**
  - Request - 主请求类
  - Interceptor - 拦截器管理
  - Requestor - 请求器接口
- **实现**
  - FetchRequestor - Fetch API 实现
  - AxiosRequestor - Axios 实现
- **功能模块**
  - Retry - 重试功能
  - Cache - 缓存功能
  - Parallel - 并发控制
  - Idempotent - 幂等性保证
  - Timeout - 超时控制

### 示例 (Examples)

- **基础示例**
  - 基本用法
  - 配置选项
- **功能示例**
  - 重试示例
  - 缓存示例
  - 拦截器示例
- **实际应用**
  - RESTful API
  - 文件上传
  - 认证授权

## 🚀 快速链接

- [快速开始](/guide/getting-started)
- [核心功能](/guide/features/retry)
- [API 文档](/api/core/request)
- [示例代码](/examples/basic)

## 💡 常见问题

### 如何选择实现？

- **Fetch** - 推荐用于现代浏览器和 Node.js 18+
- **Axios** - 需要更多功能或支持旧版本浏览器

### 如何配置重试？

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    retry: {
      maxRetries: 3,
      retryDelay: 1000
    }
  }
);
```

### 如何添加认证？

```typescript
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
    return config;
  }
});
```

## 🔗 相关资源

- [GitHub](https://github.com/Sunny-117/ureq)
- [npm](https://www.npmjs.com/package/@ureq/core)
- [Changelog](https://github.com/Sunny-117/ureq/blob/main/CHANGELOG.md)

## 📝 贡献

欢迎贡献文档！如果发现文档有误或需要改进，请：

1. Fork 项目
2. 创建分支
3. 提交 PR

## 📄 许可证

MIT License
