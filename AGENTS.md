# ClimeLens AGENTS.md

AI 编码规范与项目约束 — 所有 AI 工具生成代码时必须遵守。

---

## 项目概述

ClimeLens (代号 Calyx Home) 是全屋智能温控系统，融合 MQTT 物联网通信、React Three Fiber 3D 可视化、LangChain.js AI Agent 三大技术栈。

## 技术栈速查

| 包 | 运行时 | 框架 | 语言 | 关键依赖 |
|---|--------|------|------|----------|
| `client/` | 浏览器 | React 19 + Vite 6 + Tailwind 4 | TypeScript 5.7 | zustand, GSAP, motion, shadcn/ui |
| `server/` | Node.js | NestJS 11 | TypeScript 5.7 | @nestjs/microservices, @langchain/core |
| `apps/shared/` | — | — | TypeScript | 前后端共享类型和常量 |

## Monorepo 包管理

- 包管理器：**pnpm**，workspace 配置在 `pnpm-workspace.yaml`
- 根目录 `pnpm dev` 同时启动 client 和 server
- 共享类型放在 `apps/shared/`，通过 `@climelens/shared` 引用
- 子包间依赖使用 `workspace:*` 协议
- 严禁在子包中 `pnpm install`，始终在根目录执行

---

## 通用编码规则

1. **禁止行内注释**：不要在代码逻辑中写解释性注释，代码应自解释
2. **函数必须有 JSDoc**：所有函数/方法（除 React 组件和简单 getter/setter 外）必须写完整 JSDoc，包含功能说明、`@param`（每个参数的含义和约束）、`@returns`（返回值说明）
3. **禁止 emoji**：代码、文档、commit 消息中都不出现 emoji
4. **使用现有库**：引入新依赖前先检查项目是否已有同类库
5. **遵循现有模式**：创建新文件前先看同目录下已有文件的写法
6. **不要创建 README / 文档**：除非明确要求

---

## Client 规则

### 目录结构
```
client/src/
├── components/        # UI 组件
│   ├── Common/        #   通用组件（FrostedGlass 等）
│   ├── Panel/         #   控制面板组件
│   ├── Scene/         #   3D 场景组件（R3F）
│   └── ui/            #   shadcn/ui 基础组件
├── hooks/             # 自定义 Hooks
├── store/             # Zustand stores
├── services/          # API 调用、MQTT 连接
├── types/             # 纯前端类型（TabId, RoomData 等 UI 数据）
├── utils/             # 工具函数
└── lib/               # 第三方库封装
```

### Import 路径
- 内部文件统一用 `@/` 别名，如 `import { rooms } from "@/types/room"`
- 共享类型用 `@climelens/shared`，如 `import type { SensorDataPayload } from '@climelens/shared'`

### 样式
- **Tailwind CSS 4**，不用 CSS Modules 或 styled-components
- 毛玻璃卡片统一用 `bg-[rgba(255,248,246,0.45)] backdrop-blur-[32px] border border-white/40`
- Design Token 在 `client/DESIGN.md`，颜色以 Material You 暖色调为主

### 架构
- 状态管理用 **zustand**，store 按领域拆分（sensorStore / deviceStore / aiStore）
- 动画用 **motion**（原 framer-motion）或 **GSAP**
- 3D 场景用 **React Three Fiber** + **@react-three/drei**
- MQTT 连接封装在 `services/mqtt.service.ts`，通过 hooks 暴露给组件
- 数据流：MQTT 消息 → service → zustand store → hooks → 组件

### 组件规范
- 函数组件 + TypeScript，不用 class component
- Props 类型用 interface，定义在组件文件内或同目录
- 组件文件命名为 PascalCase，如 `RoomStrip.tsx`
- **UI 组件优先从 shadcn/ui 下载**：设计交互组件（Button、Dialog、Slider、Switch 等）时，先用 `npx shadcn@latest add <component>` 添加，shadcn 没有对应组件时再自行编写

---

## Server 规则

### 目录结构
```
server/src/
├── common/            # 全局：filter / interceptor / pipe / decorator
├── config/            # 环境配置：broker / database / ai
├── mqtt/              # MQTT 模块：controller + service + dto
├── room/              # 房间模块：controller + service + dto + schemas
├── gateway/           # WebSocket 推送模块
├── agent/             # AI Agent：controller + service + tools + graph + prompts
├── influx/            # InfluxDB 时序数据模块
└── health/            # 健康检查模块
```

### 模块规范
- 采用 NestJS **领域模块**组织，每个模块内聚 controller + service + dto + schemas
- Controller 只做路由和参数校验，业务逻辑放 Service
- DTO 用 class + `class-validator` 装饰器校验
- 跨模块共享的类型定义在 `apps/shared/`，不要在后端重复定义

### NestJS 约定
- `@EventPattern` 消费 MQTT 消息，`@MessagePattern` 需要响应时使用
- 全局异常通过 `common/filters/http-exception.filter.ts` 统一处理
- 响应格式通过 `common/interceptors/transform.interceptor.ts` 统一包裹为 `{ code, data, message }`

### 代码风格
- 单引号、尾逗号（参考 `.prettierrc`）
- NestJS 装饰器风格，不用 class-validator 以外的校验方式

---

## Shared 规则

- `apps/shared/src/index.ts` 是唯一入口，所有导出必须经过它
- 类型文件以 `.types.ts` 结尾，常量文件以功能命名
- 只放前后端真正共用的定义，纯前端类型（UI 状态、TabId 等）放 `client/src/types/`

---

## 环境与基础设施

- 本地开发依赖 Docker：`docker compose up -d` 启动 EMQX + Redis + InfluxDB
- 环境变量在 `.env`（不提交），模板放 `.env.example`
- 暂不需要 PostgreSQL：前期用 InfluxDB 满足所有数据需求

---

## 常用命令

```bash
# 根目录
pnpm install          # 安装所有依赖
pnpm dev              # 并行启动 client + server
pnpm dev:client       # 仅启动前端
pnpm dev:server       # 仅启动后端
docker compose up -d  # 启动本地基础设施

# client/
pnpm --filter @climelens/client build   # 前端构建
pnpm --filter @climelens/client preview # 预览构建产物

# server/
pnpm --filter @climelens/server start:dev  # 后端开发模式
pnpm --filter @climelens/server test       # 运行测试
pnpm --filter @climelens/server lint       # ESLint
```

## 禁止事项

- 不要引入与现有技术栈冲突的库（如 antd 已有 shadcn/ui 的情况）
- 不要在后端重复定义 `apps/shared/` 中已有的类型
- 不要在组件中直接操作 DOM（用 React 方式）
- 不要创建新的 workspace 包而不更新 `pnpm-workspace.yaml`
