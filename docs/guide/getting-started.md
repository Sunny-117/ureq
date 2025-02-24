# 快速开始

## 安装

```bash
# npm
npm install @request/core @request/impl-fetch

# pnpm 
pnpm add @request/core @request/impl-fetch
```

## 基础使用

```typescript
import { Request } from '@request/core';
import { FetchRequestor } from '@request/impl-fetch';

const request = new Request(new FetchRequestor());

// GET 请求
const data = await request.get('https://api.example.com/data');

// POST 请求
const result = await request.post('https://api.example.com/create', {
  name: 'test'
});
``` 