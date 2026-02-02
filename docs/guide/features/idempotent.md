# 幂等性保证

自动去重相同的请求，防止重复提交。

## 基础用法

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(
  new FetchRequestor(),
  {
    idempotent: {
      dedupeTime: 1000  // 1 秒内的相同请求会被去重
    }
  }
);

// 快速连续发起相同请求
const promise1 = request.get('/api/users/1');
const promise2 = request.get('/api/users/1');  // 会复用 promise1 的结果

// 两个请求会得到相同的结果，但只发送一次网络请求
const [user1, user2] = await Promise.all([promise1, promise2]);
console.log(user1 === user2);  // true
```

## 配置选项

### dedupeTime

请求去重的时间窗口（毫秒）。

```typescript
{
  idempotent: {
    dedupeTime: 1000  // 默认值：1000ms (1秒)
  }
}
```

### getRequestId

自定义请求标识生成函数。

```typescript
{
  idempotent: {
    getRequestId: (method, url, data, options) => {
      // 自定义请求 ID 生成逻辑
      return `${method}:${url}:${JSON.stringify(data)}`;
    }
  }
}
```

## 工作原理

幂等性保证通过以下方式工作：

1. 为每个请求生成唯一标识（基于 method、url、data、options）
2. 在时间窗口内，相同标识的请求会复用第一个请求的 Promise
3. 时间窗口过后，新的请求会正常发送

```
时间线：
0ms    500ms   1000ms  1500ms
|------|-------|-------|
请求1 ──→ 执行
请求2 ──→ 复用请求1
请求3 ──→ 复用请求1
                请求4 ──→ 新请求（超过时间窗口）
```

## 实际示例

### 示例 1：防止表单重复提交

```typescript
const formRequest = new Request(
  new FetchRequestor({
    baseURL: 'https://api.example.com'
  }),
  {
    idempotent: {
      dedupeTime: 2000  // 2 秒内防止重复提交
    }
  }
);

// 表单提交处理
async function handleSubmit(formData: FormData) {
  try {
    // 即使用户快速点击多次提交按钮，也只会发送一次请求
    const result = await formRequest.post('/api/submit', formData);
    showSuccess('提交成功');
    return result;
  } catch (error) {
    showError('提交失败');
    throw error;
  }
}

// 用户快速点击多次
button.addEventListener('click', () => handleSubmit(formData));
```

### 示例 2：搜索防抖

```typescript
const searchRequest = new Request(
  new FetchRequestor(),
  {
    idempotent: {
      dedupeTime: 500  // 500ms 内的相同搜索会被去重
    }
  }
);

async function search(keyword: string) {
  try {
    const results = await searchRequest.get('/api/search', {
      params: { q: keyword }
    });
    displayResults(results);
  } catch (error) {
    console.error('Search failed:', error);
  }
}

// 用户快速输入时，相同的搜索词只会发送一次请求
searchInput.addEventListener('input', (e) => {
  search(e.target.value);
});
```

### 示例 3：数据刷新

```typescript
const dataRequest = new Request(
  new FetchRequestor(),
  {
    idempotent: {
      dedupeTime: 3000  // 3 秒内的刷新请求会被去重
    }
  }
);

async function refreshData() {
  try {
    const data = await dataRequest.get('/api/data');
    updateUI(data);
  } catch (error) {
    console.error('Refresh failed:', error);
  }
}

// 多个组件同时触发刷新，只会发送一次请求
component1.on('refresh', refreshData);
component2.on('refresh', refreshData);
component3.on('refresh', refreshData);
```

## 自定义请求标识

### 忽略某些参数

```typescript
{
  idempotent: {
    getRequestId: (method, url, data, options) => {
      // 忽略时间戳参数
      const { timestamp, ...restData } = data || {};
      return `${method}:${url}:${JSON.stringify(restData)}`;
    }
  }
}
```

### 基于用户的去重

```typescript
{
  idempotent: {
    getRequestId: (method, url, data, options) => {
      const userId = getCurrentUserId();
      return `${userId}:${method}:${url}`;
    }
  }
}
```

## 与其他功能组合

### 幂等性 + 缓存

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    idempotent: {
      dedupeTime: 1000  // 短期去重
    },
    cache: {
      ttl: 60000  // 长期缓存
    }
  }
);

// 1 秒内的请求会被去重
// 1 分钟内的请求会从缓存返回
```

### 幂等性 + 重试

```typescript
const request = new Request(
  new FetchRequestor(),
  {
    idempotent: {
      dedupeTime: 2000
    },
    retry: {
      maxRetries: 3
    }
  }
);

// 重试的请求也会被去重
// 如果第一个请求失败并重试，后续相同请求会等待重试结果
```

## 注意事项

1. **时间窗口** - 合理设置去重时间，太短可能无效，太长可能影响用户体验
2. **请求标识** - 确保请求标识能准确区分不同的请求
3. **副作用** - 只对幂等的操作使用此功能
4. **内存管理** - 去重记录会占用内存，但会自动清理过期记录

## 适用场景

✅ **适合使用**：
- 表单提交
- 搜索请求
- 数据刷新
- 按钮点击
- 自动保存

❌ **不适合使用**：
- 需要每次都执行的操作
- 有时间敏感性的请求
- 需要获取最新数据的场景

## 相关功能

- [请求缓存](/guide/features/cache) - 长期缓存数据
- [并发控制](/guide/features/parallel) - 控制并发数量
- [重试功能](/guide/features/retry) - 失败请求自动重试
