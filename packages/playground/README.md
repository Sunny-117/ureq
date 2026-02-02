# @ureq/playground

示例和测试项目，展示 @ureq 的各种功能和用法。

## 运行示例

```bash
# 安装依赖
pnpm install

# 运行所有示例
pnpm demo:all

# 运行特定示例
pnpm demo:basic          # 基础用法
pnpm demo:features       # 功能特性
pnpm demo:interceptors   # 拦截器
pnpm demo:error-handling # 错误处理
```

## 示例列表

### 基础示例 (basic.ts)

展示基本的 HTTP 请求方法：

- GET 请求
- POST 请求
- PUT 请求
- DELETE 请求
- PATCH 请求

### 功能示例 (features.ts)

展示各种功能特性：

- 重试功能
- 缓存功能
- 并发控制
- 幂等性保证
- 超时控制

### 拦截器示例 (interceptors.ts)

展示拦截器的使用：

- 请求拦截器
- 响应拦截器
- 认证 Token
- 错误处理

### 错误处理示例 (error-handling.ts)

展示错误处理：

- Try-Catch
- 状态码处理
- 自定义错误处理
- 错误日志

## 项目结构

```
src/
├── demos/
│   ├── basic.ts           # 基础示例
│   ├── features.ts        # 功能示例
│   ├── interceptors.ts    # 拦截器示例
│   └── error-handling.ts  # 错误处理示例
└── index.ts               # 入口文件
```

## 开发

```bash
# 开发模式
pnpm dev

# 构建
pnpm build

# 运行构建后的文件
node dist/index.js
```

## 添加新示例

1. 在 `src/demos/` 目录下创建新文件
2. 导出一个异步函数
3. 在 `src/index.ts` 中导入并调用
4. 在 `package.json` 中添加对应的脚本

示例：

```typescript
// src/demos/my-demo.ts
export async function myDemo() {
  console.log('My Demo');
  // 你的示例代码
}

// src/index.ts
import { myDemo } from './demos/my-demo';

async function main() {
  await myDemo();
}

main();
```

## 文档

查看完整文档：[https://sunny-117.github.io/ureq](https://sunny-117.github.io/ureq)

## License

MIT
