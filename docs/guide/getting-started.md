# 快速开始

## 安装

```bash
# npm
npm install @ureq/core @ureq/impl-fetch

# pnpm 
pnpm add @ureq/core @ureq/impl-fetch
```

## 基础使用

```typescript
import { Request } from '@ureq';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(new FetchRequestor());

// GET 请求
const data = await request.get('https://api.example.com/data');

// POST 请求
const result = await request.post('https://api.example.com/create', {
  name: 'test'
});
``` 