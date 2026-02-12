---
layout: home

hero:
  name: "@ureq"
  text: "Universal Request Library"
  tagline: 模块化、可扩展的现代 HTTP 请求库 | A modern, modular, and extensible HTTP request library
  image:
    src: /logo.svg
    alt: "@ureq logo"
  actions:
    - theme: brand
      text: 快速开始 | Get Started
      link: /guide/getting-started
    - theme: alt
      text: 查看示例 | View Examples
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/Sunny-117/ureq

features:
  - icon: 🎯
    title: 多种实现 | Multiple Implementations
    details: 支持 Fetch 和 Axios 两种实现，可根据需求自由切换。Supports both Fetch and Axios implementations, switch freely based on your needs.
    
  - icon: 🔄
    title: 智能重试 | Smart Retry
    details: 内置指数退避重试策略，自动处理临时性错误。Built-in exponential backoff retry strategy, automatically handles transient errors.
    
  - icon: 💾
    title: 请求缓存 | Request Caching
    details: 支持内存缓存和自定义存储，提升应用性能。Supports memory cache and custom storage for better performance.
    
  - icon: 🚦
    title: 拦截器 | Interceptors
    details: 灵活的请求和响应拦截器，轻松实现认证、日志等功能。Flexible request and response interceptors for auth, logging, and more.
    
  - icon: ⚡
    title: 并发控制 | Concurrency Control
    details: 智能管理并发请求数量，避免资源耗尽。Intelligently manages concurrent requests to avoid resource exhaustion.
    
  - icon: 🔒
    title: 幂等性保证 | Idempotency
    details: 自动去重相同请求，防止重复提交。Automatically deduplicates identical requests to prevent duplicate submissions.
    
  - icon: ⏱️
    title: 超时控制 | Timeout Control
    details: 灵活的超时配置，避免请求长时间挂起。Flexible timeout configuration to avoid long-hanging requests.
    
  - icon: 🛡️
    title: 错误处理 | Error Handling
    details: 完善的错误类型和处理机制，便于调试和监控。Comprehensive error types and handling for easy debugging and monitoring.
    
  - icon: 📝
    title: TypeScript | TypeScript
    details: 完整的类型定义，提供出色的开发体验。Full type definitions for excellent developer experience.
---

## 快速安装 | Quick Installation

::: code-group

```bash [npm]
npm install @ureq/core @ureq/impl-fetch
```

```bash [pnpm]
pnpm add @ureq/core @ureq/impl-fetch
```

```bash [yarn]
yarn add @ureq/core @ureq/impl-fetch
```

:::

## 简单示例 | Simple Example

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

// 创建请求实例
const request = new Request(new FetchRequestor({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/1'
}));

// 发起请求
const data = await request.get('/users/1');
console.log(data);
```

## 为什么选择 @ureq? | Why @ureq?

<div class="why-ureq-grid">

<div class="why-ureq-card">

#### 🎨 模块化设计 | Modular Design

核心功能与具体实现分离，按需引入所需模块，保持应用轻量。

Separates core functionality from implementation, import only what you need.

</div>

<div class="why-ureq-card">

#### 🔧 高度可扩展 | Highly Extensible

轻松添加自定义请求器、拦截器和功能模块。

Easily add custom requestors, interceptors, and feature modules.

</div>

<div class="why-ureq-card">

#### 🚀 开箱即用 | Ready to Use

内置常用功能如重试、缓存、超时等，无需额外配置。

Built-in features like retry, cache, timeout with no extra config.

</div>

<div class="why-ureq-card">

#### 💪 类型安全 | Type Safe

完整的 TypeScript 支持，享受智能提示和类型检查。

Full TypeScript support with intelligent hints and type checking.

</div>

</div>

<style scoped>
.why-ureq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.why-ureq-card {
  padding: 1.5rem;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  transition: all 0.3s ease;
}

.why-ureq-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--vp-c-brand);
}

.why-ureq-card h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.why-ureq-card p {
  margin: 0.5rem 0;
  line-height: 1.6;
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
}

.why-ureq-card p:last-child {
  margin-bottom: 0;
}
</style>
 