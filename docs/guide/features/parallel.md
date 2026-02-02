# 并发控制

限制同时进行的请求数量，避免资源耗尽。

## 基础用法

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(
  new FetchRequestor(),
  {
    parallel: {
      maxConcurrent: 5  // 最多同时 5 个请求
    }
  }
);

// 发起 10 个请求，但最多同时只有 5 个在执行
const promises = Array.from({ length: 10 }, (_, i) =>
  request.get(`/api/users/${i}`)
);

const results = await Promise.all(promises);
```

## 配置选项

### maxConcurrent

最大并发请求数。

```typescript
{
  parallel: {
    maxConcurrent: 5  // 默认值：5
  }
}
```

### timeout

并发请求的总超时时间（毫秒）。

```typescript
{
  parallel: {
    timeout: 30000  // 默认值：30000ms (30秒)
  }
}
```

## 工作原理

并发控制使用请求队列来管理并发：

1. 当并发数未达到上限时，请求立即执行
2. 当并发数达到上限时，新请求进入队列等待
3. 当有请求完成时，从队列中取出下一个请求执行

```
请求 1 ──┐
请求 2 ──┼─→ 执行中 (5个)
请求 3 ──┤
请求 4 ──┤
请求 5 ──┘
请求 6 ──┐
请求 7 ──┼─→ 队列中 (等待)
请求 8 ──┘
```

## 实际示例

### 示例 1：批量下载文件

```typescript
const downloadRequest = new Request(
  new FetchRequestor({
    baseURL: 'https://cdn.example.com'
  }),
  {
    parallel: {
      maxConcurrent: 3  // 同时最多下载 3 个文件
    },
    timeout: {
      timeout: 60000  // 每个文件 60 秒超时
    }
  }
);

async function downloadFiles(fileUrls: string[]) {
  const promises = fileUrls.map(url =>
    downloadRequest.get(url)
      .then(data => ({ url, data, success: true }))
      .catch(error => ({ url, error, success: false }))
  );
  
  const results = await Promise.all(promises);
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`Downloaded: ${successful.length}/${fileUrls.length}`);
  console.log(`Failed: ${failed.length}`);
  
  return results;
}

// 下载 20 个文件，但同时最多 3 个
const files = Array.from({ length: 20 }, (_, i) => `/files/file${i}.pdf`);
await downloadFiles(files);
```

### 示例 2：批量 API 调用

```typescript
const apiRequest = new Request(
  new FetchRequestor({
    baseURL: 'https://api.example.com'
  }),
  {
    parallel: {
      maxConcurrent: 10
    },
    retry: {
      maxRetries: 2
    }
  }
);

async function batchUpdateUsers(users: User[]) {
  console.log(`Updating ${users.length} users...`);
  
  const promises = users.map(user =>
    apiRequest.put(`/users/${user.id}`, user)
  );
  
  const results = await Promise.allSettled(promises);
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`Success: ${successful}, Failed: ${failed}`);
  
  return results;
}
```

### 示例 3：分页数据加载

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    parallel: {
      maxConcurrent: 5
    }
  }
);

async function loadAllPages(totalPages: number) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  const promises = pages.map(page =>
    request.get('/api/data', { params: { page } })
  );
  
  const results = await Promise.all(promises);
  
  // 合并所有页的数据
  return results.flatMap(r => r.items);
}

// 加载 20 页数据，同时最多 5 个请求
const allData = await loadAllPages(20);
```

## 与其他功能组合

### 并发 + 重试

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    parallel: {
      maxConcurrent: 5
    },
    retry: {
      maxRetries: 3,
      retryDelay: 1000
    }
  }
);

// 失败的请求会自动重试，但仍然受并发限制
```

### 并发 + 缓存

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    parallel: {
      maxConcurrent: 5
    },
    cache: {
      ttl: 60000
    }
  }
);

// 缓存的请求不会占用并发槽位
```

## 性能优化

### 动态调整并发数

```typescript
// 根据网络状况动态调整
let maxConcurrent = 5;

if (navigator.connection) {
  const effectiveType = navigator.connection.effectiveType;
  
  switch (effectiveType) {
    case '4g':
      maxConcurrent = 10;
      break;
    case '3g':
      maxConcurrent = 5;
      break;
    case '2g':
      maxConcurrent = 2;
      break;
  }
}

const request = new Request(
  new FetchRequestor(),
  {
    parallel: {
      maxConcurrent
    }
  }
);
```

### 分批处理

```typescript
async function batchProcess<T>(
  items: T[],
  processor: (item: T) => Promise<any>,
  batchSize: number = 10
) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    results.push(...batchResults);
    
    console.log(`Processed ${Math.min(i + batchSize, items.length)}/${items.length}`);
  }
  
  return results;
}

// 处理 100 个项目，每批 10 个
await batchProcess(items, async (item) => {
  return request.post('/api/process', item);
}, 10);
```

## 注意事项

1. **合理设置并发数** - 根据服务器能力和网络状况设置
2. **避免过多并发** - 可能导致服务器拒绝服务或浏览器资源耗尽
3. **错误处理** - 使用 `Promise.allSettled` 处理部分失败的情况
4. **进度反馈** - 对于大量请求，提供进度提示

## 相关功能

- [重试功能](/guide/features/retry) - 失败请求自动重试
- [超时控制](/guide/features/timeout) - 避免请求长时间挂起
- [幂等性保证](/guide/features/idempotent) - 避免重复请求
