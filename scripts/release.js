#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function print(color, symbol, message) {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

const log = {
  info: (msg) => print(colors.blue, 'ℹ', msg),
  success: (msg) => print(colors.green, '✓', msg),
  warning: (msg) => print(colors.yellow, '⚠', msg),
  error: (msg) => print(colors.red, '✗', msg),
};

function exec(command, options = {}) {
  try {
    return execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options,
    });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return null;
  }
}

function showHelp() {
  console.log(`
使用方法: pnpm release:script [选项]

选项:
  --alpha, -a          发布 alpha 预发布版本
  --beta, -b           发布 beta 预发布版本
  --tag <tag>          指定 npm dist-tag（默认：latest 或 alpha）
  --message, -m <msg>  自定义 changeset 消息
  --dry-run            模拟发布，不实际发布到 npm
  --no-git-check       跳过 git 状态检查
  --help, -h           显示此帮助信息

示例:
  pnpm release:script                           # 发布正式版本
  pnpm release:script --alpha                   # 发布 alpha 版本
  pnpm release:script --beta                    # 发布 beta 版本
  pnpm release:script -m "修复重要 bug"         # 自定义发布消息
  pnpm release:script --alpha -m "新功能测试"   # alpha 版本自定义消息
  pnpm release:script --dry-run                 # 模拟发布
  pnpm release:script --alpha --tag next        # 发布 alpha 版本到 next tag
`);
}

// 解析命令行参数
const args = process.argv.slice(2);
const options = {
  releaseType: 'stable',
  npmTag: '',
  dryRun: false,
  skipGitCheck: false,
  message: '',
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case '--alpha':
    case '-a':
      options.releaseType = 'alpha';
      break;
    case '--beta':
    case '-b':
      options.releaseType = 'beta';
      break;
    case '--tag':
      options.npmTag = args[++i];
      break;
    case '--message':
    case '-m':
      options.message = args[++i];
      break;
    case '--dry-run':
      options.dryRun = true;
      break;
    case '--no-git-check':
      options.skipGitCheck = true;
      break;
    case '--help':
    case '-h':
      showHelp();
      process.exit(0);
      break;
    default:
      log.error(`未知参数: ${arg}`);
      showHelp();
      process.exit(1);
  }
}

// 设置默认 tag
if (!options.npmTag) {
  options.npmTag = options.releaseType === 'stable' ? 'latest' : options.releaseType;
}

async function main() {
  log.info(`发布类型: ${options.releaseType}`);
  log.info(`NPM Tag: ${options.npmTag}`);
  if (options.dryRun) {
    log.warning('模拟发布模式（不会实际发布）');
  }

  // 检查是否在项目根目录
  if (!fs.existsSync('package.json') || !fs.existsSync('pnpm-workspace.yaml')) {
    log.error('请在项目根目录运行此脚本');
    process.exit(1);
  }

  // 检查 git 状态
  if (!options.skipGitCheck) {
    log.info('检查 git 状态...');
    const gitStatus = exec('git status --porcelain', { silent: true });
    if (gitStatus && gitStatus.trim()) {
      log.error('工作目录有未提交的更改，请先提交或暂存');
      exec('git status --short');
      process.exit(1);
    }
    log.success('Git 状态检查通过');
  }

  // 检查是否登录 npm
  log.info('检查 npm 登录状态...');
  const npmUser = exec('npm whoami', { silent: true, ignoreError: true });
  if (!npmUser) {
    log.error('未登录 npm，请先运行: npm login');
    process.exit(1);
  }
  log.success(`已登录 npm，用户: ${npmUser.trim()}`);

  // 清理并构建
  log.info('清理旧的构建文件...');
  exec('pnpm clean', { ignoreError: true });

  log.info('构建所有包...');
  exec('pnpm build');
  log.success('构建完成');

  // 检查是否有 changeset，如果没有则自动创建
  const changesetFiles = fs.readdirSync('.changeset')
    .filter(f => f.endsWith('.md') && f !== 'README.md');
  
  if (changesetFiles.length === 0) {
    log.warning('没有找到 changeset，自动创建一个...');
    
    // 获取所有需要发布的包
    const packages = [
      '@ureq/core',
      '@ureq/business',
      '@ureq/impl-axios',
      '@ureq/impl-fetch',
      '@ureq/lib-cache-store',
      '@ureq/lib-hash',
    ];
    
    // 创建 changeset 内容
    const versionType = options.releaseType === 'stable' ? 'patch' : 'patch';
    const defaultMessage = options.releaseType === 'stable' 
      ? '发布新版本' 
      : `发布 ${options.releaseType} 预发布版本`;
    const message = options.message || defaultMessage;
    
    const changesetContent = `---
${packages.map(pkg => `"${pkg}": ${versionType}`).join('\n')}
---

${message}
`;
    
    // 生成随机文件名
    const timestamp = Date.now();
    const changesetFile = `.changeset/auto-${timestamp}.md`;
    fs.writeFileSync(changesetFile, changesetContent);
    log.success(`已创建 changeset: ${changesetFile}`);
  }

  // 根据发布类型执行不同的发布流程
  if (options.releaseType === 'alpha' || options.releaseType === 'beta') {
    log.info(`进入 ${options.releaseType} 预发布模式...`);
    
    if (!options.dryRun) {
      // 检查是否已经在 pre 模式
      const preJsonPath = '.changeset/pre.json';
      const isInPreMode = fs.existsSync(preJsonPath);
      
      if (!isInPreMode) {
        // 进入预发布模式
        log.info(`进入 ${options.releaseType} 预发布模式...`);
        exec(`pnpm changeset pre enter ${options.releaseType}`);
      } else {
        log.warning('已经在预发布模式中');
      }
      
      log.info('更新版本号...');
      exec('pnpm changeset version');
      
      log.info(`发布 ${options.releaseType} 版本到 npm...`);
      // 在 pre 模式下，changeset 会自动使用正确的 tag，不需要手动指定
      exec('pnpm changeset publish');
      
      // 退出预发布模式
      log.info('退出预发布模式...');
      exec('pnpm changeset pre exit');
      
      // 提交版本更改
      if (!options.skipGitCheck) {
        log.info('提交版本更改...');
        exec('git add .');
        exec(`git commit -m "chore: release ${options.releaseType} version"`, { ignoreError: true });
        log.success('已提交版本更改');
        
        log.warning('请手动推送到远程仓库: git push');
      }
    } else {
      log.warning('模拟发布，跳过实际发布步骤');
    }
  } else {
    // 正式版本发布
    log.info('发布正式版本...');
    
    log.info('更新版本号...');
    exec('pnpm changeset version');
    
    if (!options.dryRun) {
      log.info('发布到 npm...');
      exec(`pnpm changeset publish --tag ${options.npmTag}`);
      
      // 提交版本更改并打标签
      if (!options.skipGitCheck) {
        log.info('提交版本更改...');
        exec('git add .');
        exec('git commit -m "chore: release version"', { ignoreError: true });
        
        log.info('推送到远程仓库...');
        exec('git push');
        exec('git push --tags');
        
        log.success('已推送到远程仓库');
      }
    } else {
      log.warning('模拟发布，跳过实际发布步骤');
    }
  }

  log.success('发布完成！');
  
  // 显示发布的包信息
  log.info('查看已发布的包：');
  console.log('  npm view @ureq/core dist-tags');
  console.log('  npm view @ureq/core versions');
}

main().catch((error) => {
  log.error('发布失败');
  console.error(error);
  process.exit(1);
});
