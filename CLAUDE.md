# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

USMP 前端 — 基于 QZCA-云监管平台 的多租户管理系统前端，配套后端为 Spring Boot Java 项目。

## 常用命令

```bash
# 安装依赖（使用国内镜像）
npm install --registry=https://registry.npmmirror.com

# 开发服务器（端口 80，代理到 localhost:8080）
npm run dev

# 生产构建
npm run build:prod

# 开发环境构建
npm run build:dev

# Lint
npm run lint:eslint
npm run lint:eslint:fix

# 格式化
npm run prettier
```

Node >= 20.19.0, npm >= 8.19.0。

## 技术栈

Vue 3.5 + TypeScript 5.9 + Vite 7 + Element Plus 2.13 + Pinia 3 + Vue Router 5 + UnoCSS + VXETable 4 + Vue I18n + VueUse

## 架构要点

### API 层（src/api/）

按业务域分模块：`system/`（user/role/menu/dept/tenant/oss/...）、`monitor/`、`workflow/`、`tool/gen/`。
每个模块下有 `index.ts`（接口函数）和 `types.ts`（类型定义）。后端 API 基地址通过 `.env.*` 的 `VITE_APP_BASE_API` 配置。

### 请求封装（src/utils/request.ts）

基于 Axios，包含：
- 自动注入 `Authorization: Bearer <token>` 和 `Content-Language` 头
- AES+RSA 加解密（`VITE_APP_ENCRYPT=true` 时启用，密钥在 `.env.*`）
- 500ms 防重复提交（session 级缓存）
- 401 自动弹窗重新登录
- 文件下载通过 `download()` 方法（form-urlencoded POST → blob → FileSaver）

### 路由与权限（src/router/ + src/permission.ts）

- 静态路由：login、register、401、404、dashboard、user/profile
- 动态路由：启动时通过 `getRouters()` 从后端获取，经 `permission` store 转换后 `router.addRoute()` 注入
- 权限守卫：`src/permission.ts` 拦截全局路由，检查 token → 获取用户信息 → 生成动态路由

### 状态管理（src/store/modules/）

Pinia Composition API 风格，核心 store：
- `user` — token、用户信息、角色、权限
- `permission` — 动态路由生成、侧边栏/顶栏路由
- `app` — 侧边栏状态、设备类型、语言
- `settings` — 主题、暗色模式、导航类型等 UI 配置
- `tagsView` — 标签页缓存
- `dict` — 字典数据缓存（Map 结构）

### 组件自动导入

- Element Plus 组件和 `src/components/` 下的组件通过 `unplugin-vue-components` 自动导入，无需手动 import
- Vue/Pinia/VueUse API 通过 `unplugin-auto-import` 自动导入

### 实时通信

通过 `.env.*` 开关控制：
- SSE（`VITE_APP_SSE`）— 默认开启，使用 VueUse `useEventSource`
- WebSocket（`VITE_APP_WEBSOCKET`）— 可选，使用 VueUse `useWebSocket`
- 均推送到 `useNoticeStore` 并显示 `ElNotification`

### 国际化（src/lang/）

支持 zh_CN 和 en_US，通过 `app` store 的 locale 控制。

### 自定义指令（src/directive/）

- `v-hasPermi` — 按钮权限检查
- `v-hasRoles` — 角色检查
- `v-copyText` — 点击复制

### 环境配置

- `.env.development` — API 前缀 `/dev-api`，端口 80，代理到 `localhost:8080`
- `.env.production` — API 前缀 `/prod-api`，gzip 压缩
- 两个文件都包含 RSA 公钥、AES 密钥、客户端 ID 等配置

### 样式

SCSS + UnoCSS 混合使用。Element Plus 主题色通过 CSS 变量 `--el-color-primary` 控制。UnoCSS 配置在 `uno.config.ts`。

## 代码规范

- 2 空格缩进，单引号，无尾逗号（.prettierrc）
- ESLint + Prettier 强制执行
- Path alias: `@/` → `./src/`
- tsconfig 关闭了 `noImplicitAny` 和 `strictNullChecks`


## 当前项目事实

- 当前请求能力统一封装在 `src/utils/request.ts`
- 当前状态管理采用 `Pinia`
- 当前路由包含静态路由与动态权限路由
- 当前工作区存在未提交改动，后续处理时必须遵守 `AGENTS.md` 中的边界约束

## 使用说明

开始任何任务前，先阅读项目根目录下的 `AGENTS.md`，并严格按照其中的边界、流程、禁止事项和验收标准执行。
