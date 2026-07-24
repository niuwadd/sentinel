# ClimeLens Server — NestJS 后端

全屋智能温控系统后端服务，负责 MQTT 消息处理、REST API、WebSocket 实时推送、LangChain AI Agent 温控决策。

## 目录结构

```
server/
├── package.json                             # 项目依赖与脚本
├── tsconfig.json                            # TypeScript 编译配置
├── tsconfig.build.json                      # 生产构建配置（排除测试文件）
├── nest-cli.json                            # NestJS CLI 配置
├── eslint.config.mjs                        # ESLint 平铺配置
├── .prettierrc                              # 代码格式化规则
├── .env                                     # 环境变量（不提交 git）
├── .env.example                             # 环境变量模板（提交 git）
├── Dockerfile                               # 容器化构建
│
└── src/
    ├── main.ts                              # 应用入口：NestFactory 创建 + 全局管道/过滤器/拦截器 + 监听端口
    ├── app.module.ts                        # 根模块：汇集所有子模块 + ConfigModule.forRoot()
    │
    ├── common/                              # 全局横切层
    │   ├── common.module.ts                 #   @Global 模块，导出所有公共组件
    │   ├── filters/
    │   │   └── http-exception.filter.ts     #     统一异常捕获 → { code, message, timestamp }
    │   ├── interceptors/
    │   │   └── transform.interceptor.ts     #     统一响应包裹 → { code: 200, data, message }
    │   ├── pipes/
    │   │   └── validation.pipe.ts           #     class-validator 参数校验
    │   └── decorators/
    │       └── roles.decorator.ts           #     @Roles('admin') 权限标记
    │
    ├── config/                              # 环境配置层
    │   ├── config.module.ts                 #   @nestjs/config 注册，全局可用
    │   ├── broker.config.ts                 #   MQTT Broker：本地/云端地址、端口、认证
    │   ├── database.config.ts               #   PostgreSQL + InfluxDB 连接参数
    │   ├── ai.config.ts                     #   LLM：provider、apiKey、modelName、temperature
    │   └── env.validation.ts                #   启动时校验必填环境变量，缺失直接退出
    │
    ├── mqtt/                                # MQTT 通信模块
    │   ├── mqtt.module.ts                   #   ClientsModule.register(MQTT transport) 注册客户端
    │   ├── mqtt.controller.ts               #   @EventPattern 消费 MQTT 消息
    │   │                                     #   - house/room/+/data    → 传感器数据
    │   │                                     #   - house/room/+/status   → 设备状态
    │   ├── mqtt.service.ts                  #   MQTT 核心逻辑：连接/订阅/发布/健康检查
    │   └── dto/
    │       ├── sensor-data.dto.ts            #     传感器上报结构（temp/humi/heatIndex/battery/rssi）
    │       └── ac-command.dto.ts             #     空调下发指令结构（power/mode/targetTemp/fanSpeed）
    │
    ├── room/                                # 房间领域模块
    │   ├── room.module.ts                   #   导入 MqttModule + GatewayModule + InfluxModule
    │   ├── room.controller.ts               #   REST API
    │   │                                     #   - GET  /api/rooms                   房间列表
    │   │                                     #   - GET  /api/rooms/:id                房间当前状态
    │   │                                     #   - GET  /api/rooms/:id/data?range=   历史数据
    │   │                                     #   - POST /api/rooms/:id/ac/control     空调控制
    │   ├── room.service.ts                  #   业务逻辑：房间查询、指令校验、调用 MqttService 下发
    │   ├── dto/
    │   │   ├── query-history.dto.ts          #     查询参数：range(1h|24h|7d|30d)、interval
    │   │   ├── ac-control.dto.ts             #     请求体：mode/targetTemp/fanSpeed/swing（含校验）
    │   │   └── room-response.dto.ts          #     响应体字段定义
    │   └── schemas/
    │       └── room.schema.ts                #     房间实体：id/name/icon/floor/position/createdAt
    │
    ├── gateway/                             # WebSocket 实时推送模块
    │   ├── gateway.module.ts                #   注册 WebSocketGateway
    │   └── room.gateway.ts                  #   Socket.IO /rooms 命名空间
    │                                         #   - 客户端按 roomId 加入房间
    │                                         #   - broadcastRoomData()：推送传感器更新
    │                                         #   - broadcastAiDecision()：广播 AI 决策
    │
    ├── agent/                               # LangChain AI Agent 模块
    │   ├── agent.module.ts                  #   导入 MqttModule + InfluxModule
    │   ├── agent.controller.ts              #   REST API
    │   │                                     #   - GET  /api/agent/status           AI 启停状态
    │   │                                     #   - POST /api/agent/on               开启 AI
    │   │                                     #   - POST /api/agent/off              关闭 AI（阈值模式）
    │   │                                     #   - GET  /api/agent/decisions        决策历史
    │   │                                     #   - PUT  /api/agent/preferences      用户偏好
    │   ├── agent.service.ts                 #   Agent 编排：创建实例、调度评估、降级阈值、决策记录
    │   ├── tools/                           #   LangChain StructuredTool 工具集
    │   │   ├── tools.index.ts               #     汇总导出，供 Agent 注册
    │   │   ├── check-env.tool.ts            #     Tool: 查询房间当前温湿度
    │   │   └── control-ac.tool.ts           #     Tool: 下发空调控制指令
    │   ├── graph/
    │   │   └── thermostat.graph.ts          #   LangGraph 温控状态机：感知→分析→决策→执行→反思
    │   ├── prompts/
    │   │   └── system.prompt.ts             #   系统提示词：角色 + 约束 + 输出格式
    │   ├── dto/
    │   │   ├── ai-preference.dto.ts         #     用户偏好（舒适范围/节能模式/离家模式）
    │   │   └── decision-log.dto.ts          #     决策记录（roomId/reason/command/timestamp）
    │   └── schemas/
    │       └── decision-log.schema.ts       #     决策日志持久化实体
    │
    ├── influx/                              # InfluxDB 时序数据库模块
    │   ├── influx.module.ts                 #   InfluxDB Client 连接 + 导出
    │   └── influx.service.ts               #   写入传感器数据点 / 聚合查询(mean/max/min) / 最新值
    │
    └── health/                              # 系统健康检查模块
        ├── health.module.ts                 #   模块定义
        └── health.controller.ts             #   GET /api/system/health
                                              #   返回 MQTT/PostgreSQL/InfluxDB/Agent 各组件状态
```

## 模块依赖

```
ConfigModule  ← 全局，被所有模块依赖
CommonModule  ← 全局，导出 filter/interceptor/pipe/decorator

MqttModule     ← 被 RoomModule、AgentModule 依赖
InfluxModule   ← 被 MqttModule、RoomModule、AgentModule 依赖
GatewayModule  ← 被 MqttModule、AgentModule 依赖

RoomModule     ← 依赖 MqttModule + InfluxModule + GatewayModule
AgentModule    ← 依赖 MqttModule + InfluxModule + GatewayModule
HealthModule   ← 依赖 MqttModule + InfluxModule
```

## 数据库

| 数据库 | 存储内容 | 用途 |
|--------|----------|------|
| **InfluxDB** | 传感器时序数据（温湿度每 30s 上报） | 历史趋势查询、聚合统计、自动过期 |
| **PostgreSQL** | 房间/设备配置、AI 决策日志、用户偏好 | 关系数据持久化 |

## 快速开始

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 启动开发服务器
npm run start:dev

# 运行测试
npm run test
npm run test:e2e
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `CLOUD_MQTT_URL` | 云端 EMQX Broker 地址 |
| `CLOUD_MQTT_USERNAME` | 云端 MQTT 用户名 |
| `CLOUD_MQTT_PASSWORD` | 云端 MQTT 密码 |
| `OPENAI_API_KEY` | LangChain LLM API Key |
| `DATABASE_URL` | PostgreSQL 连接字符串 |
| `INFLUXDB_URL` | InfluxDB 地址 |
| `INFLUXDB_TOKEN` | InfluxDB 认证 Token |
| `INFLUXDB_ORG` | InfluxDB 组织名 |
| `INFLUXDB_BUCKET` | InfluxDB 数据桶名 |
| `PORT` | 服务端口（默认 3000） |
