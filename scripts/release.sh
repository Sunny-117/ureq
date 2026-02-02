#!/bin/bash

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# 显示帮助信息
show_help() {
    cat << EOF
使用方法: pnpm release [选项]

选项:
  --alpha, -a          发布 alpha 预发布版本
  --beta, -b           发布 beta 预发布版本
  --snapshot, -s       发布 snapshot 版本（不修改 package.json）
  --tag <tag>          指定 npm dist-tag（默认：latest 或 alpha）
  --dry-run            模拟发布，不实际发布到 npm
  --no-git-check       跳过 git 状态检查
  --help, -h           显示此帮助信息

示例:
  pnpm release                    # 发布正式版本
  pnpm release --alpha            # 发布 alpha 版本
  pnpm release --beta             # 发布 beta 版本
  pnpm release --snapshot         # 发布 snapshot 版本
  pnpm release --dry-run          # 模拟发布
  pnpm release --alpha --tag next # 发布 alpha 版本到 next tag

EOF
}

# 解析命令行参数
RELEASE_TYPE="stable"
NPM_TAG=""
DRY_RUN=false
SKIP_GIT_CHECK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --alpha|-a)
            RELEASE_TYPE="alpha"
            shift
            ;;
        --beta|-b)
            RELEASE_TYPE="beta"
            shift
            ;;
        --snapshot|-s)
            RELEASE_TYPE="snapshot"
            shift
            ;;
        --tag)
            NPM_TAG="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --no-git-check)
            SKIP_GIT_CHECK=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            print_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 设置默认 tag
if [ -z "$NPM_TAG" ]; then
    case $RELEASE_TYPE in
        alpha)
            NPM_TAG="alpha"
            ;;
        beta)
            NPM_TAG="beta"
            ;;
        snapshot)
            NPM_TAG="snapshot"
            ;;
        *)
            NPM_TAG="latest"
            ;;
    esac
fi

print_info "发布类型: $RELEASE_TYPE"
print_info "NPM Tag: $NPM_TAG"
if [ "$DRY_RUN" = true ]; then
    print_warning "模拟发布模式（不会实际发布）"
fi

# 检查是否在项目根目录
if [ ! -f "package.json" ] || [ ! -f "pnpm-workspace.yaml" ]; then
    print_error "请在项目根目录运行此脚本"
    exit 1
fi

# 检查 git 状态
if [ "$SKIP_GIT_CHECK" = false ]; then
    print_info "检查 git 状态..."
    if [ -n "$(git status --porcelain)" ]; then
        print_error "工作目录有未提交的更改，请先提交或暂存"
        git status --short
        exit 1
    fi
    print_success "Git 状态检查通过"
fi

# 检查是否登录 npm
print_info "检查 npm 登录状态..."
if ! npm whoami &> /dev/null; then
    print_error "未登录 npm，请先运行: npm login"
    exit 1
fi
NPM_USER=$(npm whoami)
print_success "已登录 npm，用户: $NPM_USER"

# 清理并构建
print_info "清理旧的构建文件..."
pnpm clean || true

print_info "构建所有包..."
pnpm build

if [ $? -ne 0 ]; then
    print_error "构建失败"
    exit 1
fi
print_success "构建完成"

# 根据发布类型执行不同的发布流程
case $RELEASE_TYPE in
    snapshot)
        print_info "创建 snapshot 版本..."
        if [ "$DRY_RUN" = true ]; then
            pnpm changeset version --snapshot
            print_warning "模拟发布，跳过实际发布步骤"
        else
            pnpm changeset version --snapshot
            pnpm changeset publish --tag "$NPM_TAG"
        fi
        ;;
    
    alpha|beta)
        print_info "进入预发布模式..."
        
        # 检查是否有 changeset，如果没有则自动创建
        if [ ! "$(ls -A .changeset/*.md 2>/dev/null | grep -v README)" ]; then
            print_warning "没有找到 changeset，自动创建一个..."
            
            # 创建 changeset 内容
            TIMESTAMP=$(date +%s)
            CHANGESET_FILE=".changeset/auto-${TIMESTAMP}.md"
            
            cat > "$CHANGESET_FILE" << EOF
---
"@ureq/core": patch
"@ureq/business": patch
"@ureq/impl-axios": patch
"@ureq/impl-fetch": patch
"@ureq/lib-cache-store": patch
"@ureq/lib-hash": patch
---

发布 $RELEASE_TYPE 预发布版本
EOF
            
            print_success "已创建 changeset: $CHANGESET_FILE"
        fi
        
        if [ "$DRY_RUN" = true ]; then
            print_warning "模拟发布，跳过实际发布步骤"
        else
            # 检查是否已经在 pre 模式
            if [ ! -f ".changeset/pre.json" ]; then
                print_info "进入 $RELEASE_TYPE 预发布模式..."
                pnpm changeset pre enter "$RELEASE_TYPE"
            else
                print_warning "已经在预发布模式中"
            fi
            
            print_info "更新版本号..."
            pnpm changeset version
            
            print_info "发布 $RELEASE_TYPE 版本到 npm..."
            # 在 pre 模式下，changeset 会自动使用正确的 tag
            pnpm changeset publish
            
            # 退出预发布模式
            print_info "退出预发布模式..."
            pnpm changeset pre exit
            
            # 提交版本更改
            if [ "$SKIP_GIT_CHECK" = false ]; then
                print_info "提交版本更改..."
                git add .
                git commit -m "chore: release $RELEASE_TYPE version" || true
                print_success "已提交版本更改"
                print_warning "请手动推送到远程仓库: git push"
            fi
        fi
        ;;
    
    stable)
        print_info "发布正式版本..."
        
        # 检查是否有 changeset，如果没有则自动创建
        if [ ! "$(ls -A .changeset/*.md 2>/dev/null | grep -v README)" ]; then
            print_warning "没有找到 changeset，自动创建一个..."
            
            # 创建 changeset 内容
            TIMESTAMP=$(date +%s)
            CHANGESET_FILE=".changeset/auto-${TIMESTAMP}.md"
            
            cat > "$CHANGESET_FILE" << EOF
---
"@ureq/core": patch
"@ureq/business": patch
"@ureq/impl-axios": patch
"@ureq/impl-fetch": patch
"@ureq/lib-cache-store": patch
"@ureq/lib-hash": patch
---

发布新版本
EOF
            
            print_success "已创建 changeset: $CHANGESET_FILE"
        fi
        
        print_info "更新版本号..."
        pnpm changeset version
        
        if [ "$DRY_RUN" = true ]; then
            print_warning "模拟发布，跳过实际发布步骤"
        else
            print_info "发布到 npm..."
            pnpm changeset publish --tag "$NPM_TAG"
            
            # 提交版本更改并打标签
            if [ "$SKIP_GIT_CHECK" = false ]; then
                print_info "提交版本更改..."
                git add .
                git commit -m "chore: release version" || true
                
                print_info "推送到远程仓库..."
                git push
                git push --tags
                
                print_success "已推送到远程仓库"
            fi
        fi
        ;;
esac

print_success "发布完成！"

# 显示发布的包信息
print_info "已发布的包："
case $RELEASE_TYPE in
    snapshot)
        print_info "Snapshot 版本已发布到 tag: $NPM_TAG"
        ;;
    alpha|beta)
        print_info "$RELEASE_TYPE 版本已发布到 tag: $NPM_TAG"
        ;;
    stable)
        print_info "正式版本已发布到 tag: $NPM_TAG"
        ;;
esac

print_info "查看已发布的包："
echo "  npm view @ureq/core dist-tags"
echo "  npm view @ureq/core versions"
