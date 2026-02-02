# RESTful API 示例

完整的 RESTful API 客户端实现。

## 定义类型

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface CreateUserDto {
  name: string;
  email: string;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
}
```

## 创建 API 客户端

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(
  new FetchRequestor({
    baseURL: 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json'
    }
  }),
  {
    retry: { maxRetries: 3 },
    cache: { ttl: 60000 },
    timeout: { timeout: 5000 }
  }
);

// 添加认证
request.interceptors.addRequestInterceptor({
  onRequest: (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    return config;
  }
});
```

## API 方法

```typescript
class UserAPI {
  // 获取用户列表
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<User[]> {
    return request.get<User[]>('/users', { params });
  }

  // 获取单个用户
  static async getUser(id: number): Promise<User> {
    return request.get<User>(`/users/${id}`);
  }

  // 创建用户
  static async createUser(data: CreateUserDto): Promise<User> {
    return request.post<User>('/users', data);
  }

  // 更新用户
  static async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    return request.put<User>(`/users/${id}`, data);
  }

  // 部分更新用户
  static async patchUser(id: number, data: Partial<User>): Promise<User> {
    return request.patch<User>(`/users/${id}`, data);
  }

  // 删除用户
  static async deleteUser(id: number): Promise<void> {
    return request.delete(`/users/${id}`);
  }

  // 搜索用户
  static async searchUsers(keyword: string): Promise<User[]> {
    return request.get<User[]>('/users/search', {
      params: { q: keyword }
    });
  }
}
```

## 使用示例

```typescript
async function main() {
  try {
    // 获取用户列表
    const users = await UserAPI.getUsers({ page: 1, limit: 10 });
    console.log('Users:', users);

    // 创建新用户
    const newUser = await UserAPI.createUser({
      name: 'John Doe',
      email: 'john@example.com'
    });
    console.log('Created:', newUser);

    // 获取用户详情
    const user = await UserAPI.getUser(newUser.id);
    console.log('User:', user);

    // 更新用户
    const updated = await UserAPI.updateUser(newUser.id, {
      name: 'Jane Doe'
    });
    console.log('Updated:', updated);

    // 部分更新
    const patched = await UserAPI.patchUser(newUser.id, {
      email: 'jane@example.com'
    });
    console.log('Patched:', patched);

    // 搜索用户
    const searchResults = await UserAPI.searchUsers('jane');
    console.log('Search results:', searchResults);

    // 删除用户
    await UserAPI.deleteUser(newUser.id);
    console.log('Deleted');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## 错误处理

```typescript
class UserAPI {
  static async getUser(id: number): Promise<User | null> {
    try {
      return await request.get<User>(`/users/${id}`);
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async createUser(data: CreateUserDto): Promise<User> {
    try {
      return await request.post<User>('/users', data);
    } catch (error) {
      if (error.status === 422) {
        throw new Error('数据验证失败: ' + error.response?.message);
      }
      throw error;
    }
  }
}
```

## 相关

- [基本用法](/examples/basic)
- [配置选项](/examples/configuration)
- [错误处理](/guide/advanced/error-handling)
