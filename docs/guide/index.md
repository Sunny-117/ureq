# 介绍

@ureq 是一个现代化的、模块化的、可扩展的 HTTP 请求库，专为 JavaScript/TypeScript 应用设计。

## 核心特性

### 🎯 多种实现支持

@ureq 支持多种 HTTP 实现方式：

- **Fetch API** - 轻量级，适合现代浏览器和 Node.js 18+
- **Axios** - 功能丰富，适合需要更多特性的场景

你可以根据项目需求自由选择，甚至可以实现自己的请求器。

### 🔄 丰富的功能特性

- **智能重试** - 自动重试失败的请求，支持指数退避
- **请求缓存** - 内置缓存机制，减少不必要的网络请求
- **并发控制** - 限制同时进行的请求数量
- **幂等性保证** - 自动去重相同的请求
- **超时控制** - 灵活的超时配置
- **拦截器** - 请求和响应拦截器

### 📦 模块化设计

```
@ureq/core          # 核心功能
@ureq/impl-fetch    # Fetch 实现
@ureq/impl-axios    # Axios 实现
@ureq/business      # 业务抽象层
@ureq/lib-cache-store  # 缓存存储
@ureq/lib-hash      # 哈希工具
```

每个包都可以独立使用，按需引入。

## 为什么选择 @ureq?

### 与其他库的对比

| 特性 | @ureq | Axios | Fetch API |
|------|-------|-------|-----------|
| 模块化 | ✅ | ❌ | ❌ |
| 多实现支持 | ✅ | ❌ | ❌ |
| TypeScript | ✅ | ✅ | ⚠️ |
| 请求缓存 | ✅ | ❌ | ❌ |
| 智能重试 | ✅ | ❌ | ❌ |
| 并发控制 | ✅ | ❌ | ❌ |
| 幂等性保证 | ✅ | ❌ | ❌ |
| 拦截器 | ✅ | ✅ | ❌ |
| 包大小 | 小 | 中 | 0 |

### 适用场景

@ureq 特别适合以下场景：

- 🌐 **多端应用** - 需要在浏览器和 Node.js 中使用相同的请求逻辑
- 🔄 **复杂业务** - 需要重试、缓存、并发控制等高级功能
- 🎯 **类型安全** - TypeScript 项目，需要完整的类型支持
- 📦 **模块化** - 希望按需引入功能，保持应用轻量
- 🔧 **可扩展** - 需要自定义请求器或添加自定义功能

## 设计理念

### 1. 关注点分离

@ureq 将核心逻辑与具体实现分离：

- **核心层** (`@ureq/core`) - 定义接口和组合功能
- **实现层** (`@ureq/impl-*`) - 具体的 HTTP 实现
- **业务层** (`@ureq/business`) - 业务抽象和默认实现

### 2. 组合优于继承

通过函数组合的方式添加功能，而不是通过继承：

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    retry: { maxRetries: 3 },
    cache: { ttl: 60000 },
    timeout: { timeout: 5000 }
  }
);
```

### 3. 渐进式增强

从最简单的用法开始，根据需要逐步添加功能：

```typescript
// 最简单的用法
const request = new Request(new FetchRequestor());

// 添加配置
const request = new Request(
  new FetchRequestor({ baseURL: 'https://api.example.com' })
);

// 添加功能
const request = new Request(
  new FetchRequestor({ baseURL: 'https://api.example.com' }),
  { retry: { maxRetries: 3 }, cache: { ttl: 60000 } }
);

// 添加拦截器
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    config.headers = { ...config.headers, 'Authorization': 'Bearer token' };
    return config;
  }
});
```

## 下一步

- [快速开始](/guide/getting-started) - 学习如何安装和使用 @ureq
- [核心功能](/guide/features/retry) - 了解各种功能特性
- [API 文档](/api/core/request) - 查看完整的 API 参考
- [示例代码](/examples/basic) - 查看实际使用示例
 