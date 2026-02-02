# 发布指南

## 快速发布（推荐）

发布脚本会自动创建 changeset，无需手动操作。

### 发布正式版本（latest）

```bash
pnpm release
```

### 发布 Alpha 版本

```bash
pnpm release:alpha
```

### 发布 Beta 版本

```bash
pnpm release:beta
```

### 自定义发布消息

```bash
# 正式版本
pnpm release -m "修复重要 bug"

# Alpha 版本
pnpm release:alpha -m "新功能测试"
```

### 模拟发布（不实际发布）

```bash
pnpm release:dry
```

## 手动发布流程

如果需要更精细的控制，可以手动执行：

### 1. 创建 changeset（可选）

```bash
pnpm changeset
```

选择要发布的包和版本类型（patch/minor/major），然后填写变更说明。

**注意**：如果不创建 changeset，发布脚本会自动创建一个。

### 2. 发布正式版本

```bash
# 方式一：使用发布脚本（推荐）
pnpm release

# 方式二：手动执行
pnpm changeset version  # 更新版本号
pnpm build              # 构建所有包
pnpm changeset publish  # 发布到 npm
```

### 3. 发布预发布版本

```bash
# Alpha 版本
pnpm release:alpha

# Beta 版本
pnpm release:beta
```

## 发布脚本说明

发布脚本位于 `scripts/release.js`，支持以下参数：

- `--alpha, -a`: 发布 alpha 预发布版本
- `--beta, -b`: 发布 beta 预发布版本
- `--message, -m <msg>`: 自定义 changeset 消息
- `--tag <tag>`: 指定 npm dist-tag（默认：latest 或 alpha/beta）
- `--dry-run`: 模拟发布，不实际发布到 npm
- `--no-git-check`: 跳过 git 状态检查
- `--help, -h`: 显示帮助信息

### 特性

1. **自动创建 changeset**：如果没有找到 changeset 文件，脚本会自动创建一个
2. **自动构建**：发布前自动清理和构建所有包
3. **Git 检查**：确保工作目录干净（可通过 `--no-git-check` 跳过）
4. **预发布模式管理**：自动进入和退出 changeset pre 模式
5. **版本号转换**：自动将 workspace 依赖转换为实际版本号

### 示例

```bash
# 发布正式版本到 latest
pnpm release

# 发布 alpha 版本
pnpm release:alpha

# 发布 beta 版本
pnpm release:beta

# 自定义发布消息
node scripts/release.js -m "修复登录问题"
node scripts/release.js --alpha -m "新增支付功能测试"

# 模拟发布（查看会发生什么）
pnpm release:dry

# 发布 alpha 版本到自定义 tag
node scripts/release.js --alpha --tag next

# 跳过 git 检查发布
node scripts/release.js --no-git-check
```

## 版本管理

### 版本号规则

- **patch**: 0.0.x - 修复 bug
- **minor**: 0.x.0 - 新增功能（向后兼容）
- **major**: x.0.0 - 破坏性更新

### 预发布版本

- **alpha**: 0.0.x-alpha.0 - 内部测试版本
- **beta**: 0.0.x-beta.0 - 公开测试版本

## 重要配置

### .npmrc
- `publish-workspace-protocol=true`: 发布时自动将 workspace 协议转换为实际版本

### .changeset/config.json
- `access: "public"`: 设置为公开发布
- `updateInternalDependencies: "patch"`: 内部依赖更新时自动升级 patch 版本
- `ignore`: 忽略不需要发布的包（playground、docs）

### package.json
每个包都需要：
- `publishConfig.access: "public"`: 公开发布配置
- `description`: 包描述
- `files`: 指定要发布的文件

## 注意事项

1. **登录 npm**: 确保已登录 npm：`npm login`
2. **发布权限**: 确保有 @ureq scope 的发布权限
3. **自动构建**: 发布前脚本会自动构建所有包
4. **自动 changeset**: 如果没有 changeset，脚本会自动创建
5. **workspace 依赖**: workspace 依赖会自动转换为实际版本号
6. **git 状态**: 发布前确保工作目录干净（或使用 `--no-git-check`）
7. **预发布模式**: alpha/beta 版本会自动进入和退出 pre 模式
8. **dist-tag**: 
   - 正式版本发布到 `latest` tag
   - alpha 版本发布到 `alpha` tag
   - beta 版本发布到 `beta` tag

## 验证发布

发布后可以验证：

```bash
# 查看所有版本
npm view @ureq/core versions

# 查看 dist-tags
npm view @ureq/core dist-tags

# 安装最新版本
npm install @ureq/core@latest

# 安装 alpha 版本
npm install @ureq/core@alpha
```

## 故障排除

### 问题：workspace 依赖没有转换

确保 `.npmrc` 中有：
```
publish-workspace-protocol=true
```

### 问题：发布失败 "Releasing under custom tag is not allowed in pre mode"

这是因为在 pre 模式下不能使用自定义 tag。解决方法：
1. 退出 pre 模式：`pnpm changeset pre exit`
2. 重新发布

发布脚本已经自动处理这个问题。

### 问题：latest tag 没有更新

手动更新 tag：
```bash
npm dist-tag add @ureq/core@0.0.2 latest
```
