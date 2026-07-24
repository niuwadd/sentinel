# 全屋 3D 可视化 + MQTT 物联网 + LangChain AI 温控系统完整方案

> **技术栈**：React 19 + React Three Fiber | NestJS + MQTT | LangChain.js | EMQX (本地+云端) | ESP32

---

## 目录

1. [系统概述](#1-系统概述)
2. [技术栈总览](#2-技术栈总览)
3. [系统架构](#3-系统架构)
4. [网络拓扑与部署架构](#4-网络拓扑与部署架构)
5. [项目目录结构](#5-项目目录结构)
6. [硬件层 — ESP32 物联网终端](#6-硬件层--esp32-物联网终端)
7. [通信层 — MQTT 双 Broker 架构](#7-通信层--mqtt-双-broker-架构)
8. [后端层 — NestJS 服务端](#8-后端层--nestjs-服务端)
9. [前端层 — React + React Three Fiber 3D 可视化](#9-前端层--react--react-three-fiber-3d-可视化)
10. [AI 层 — LangChain.js Agent 温控引擎](#10-ai-层--langchainjs-agent-温控引擎)
11. [数据流与业务流程](#11-数据流与业务流程)
12. [实施步骤](#12-实施步骤)
13. [软硬件清单](#13-软硬件清单)
14. [总结与展望](#14-总结与展望)

---

## 1. 系统概述

本方案整合 **MQTT 物联网通信**、**React Three Fiber 3D 可视化** 与 **LangChain.js AI Agent** 三大技术栈，构建一套完整的全屋智能温控系统。全栈基于 **TypeScript** 统一语言，前后端无缝衔接。

### 核心能力

| # | 能力 | 说明 |
|---|------|------|
| 1 | 环境感知 | 实时采集室内温湿度等多维数据 |
| 2 | 3D 可视化 | React Three Fiber 渲染全屋 3D 场景，数据驱动颜色/动画 |
| 3 | AI 决策 | LangChain.js Agent 自主分析并温控调节 |
| 4 | 远程控制 | 在外网通过云端 MQTT 远程操控家中设备 |
| 5 | 本地容灾 | 断网时本地 Broker 继续服务，AI 降级为阈值逻辑 |
| 6 | 场景联动 | 多房间协同、条件触发、定时策略一体化 |

---

## 2. 技术栈总览

### 全栈技术选型

| 层级 | 技术栈 | 关键依赖 |
|------|--------|----------|
| **前端** | React 19 + TypeScript + Vite | `@react-three/fiber`, `@react-three/drei`, `mqtt.js`, `zustand`, `antd` |
| **后端** | NestJS + TypeScript | `@nestjs/microservices`, `mqtt`, `@langchain/core`, `@langchain/openai` |
| **通信** | EMQX（本地 Broker + 云端 Broker 桥接） | TCP-MQTT（设备）, WS-MQTT（浏览器） |
| **硬件** | ESP32-WROOM-32 + C++ (Arduino) | PubSubClient, DHT22 library, IRremote |
| **AI** | LangChain.js (Node.js) | `@langchain/community`, `langgraph` |

### 为什么选这套技术栈

| 对比项 | 原方案 | 优化后方案 | 优势 |
|--------|--------|-----------|------|
| 前端 | 原生 Three.js | React + React Three Fiber | 声明式 3D 开发、组件化复用、状态管理统一 |
| 后端 | Python FastAPI | NestJS + TypeScript | 与前端共享类型、装饰器模式、微服务原生支持 |
| AI | Python LangChain | LangChain.js | 全栈统一语言、减少上下文切换、前后端类型复用 |
| MQTT | 单 Broker | 本地 + 云端双 Broker | 网络容灾、内外网统一、数据备份 |

---

## 3. 系统架构

### 3.1 整体架构图

```
┌───────────────────────────────────────────────────────────────────────┐
│                       前端层 — React 19 + R3F                         │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  @react-three/fiber 3D 场景  │  Antd 控制面板  │  Zustand    │   │
│  │  温度色块  ·  设备模型       │  实时曲线      │  状态管理    │   │
│  └───────────────────────────────┴───────────────┴──────────────┘   │
│                      │  WS-MQTT (连接本地 Broker)                     │
└──────────────────────┼───────────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────────┐
│                  通信层 — EMQX 双 Broker 架构                        │
│                                                                      │
│  ┌─────────────────────┐          ┌─────────────────────────────┐   │
│  │  🏠 本地 Broker      │◀──桥接──▶│  ☁️ 云端 Broker (EMQX Cloud)│   │
│  │  LAN: 10.0.0.x:1883 │          │  cloud.emqx.io:1883        │   │
│  │  TCP-MQTT ← 设备     │          │  ┌────────────────────┐    │   │
│  │  WS-MQTT → 前端      │          │  │ LangChain Agent    │    │   │
│  │  Redis 缓存 + 本地DB │          │  │ NestJS Server      │    │   │
│  └─────────────────────┘          │  │ PostgreSQL + Influx │    │   │
│        │                          │  └────────────────────┘    │   │
│        │                          └─────────────────────────────┘   │
│        │ TCP-MQTT 本地直连                                            │
└────────┼─────────────────────────────────────────────────────────────┘
         │
┌────────▼──────────────────────────────────────────────────────────────┐
│                    硬件层 — ESP32 物联网终端                          │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────┐   ┌─────────┐ │
│  │ DHT22 温湿度  │   │ VS1838 红外  │   │ 红外发射    │   │ WiFi    │ │
│  │ 传感器        │   │ 接收头       │   │ 38KHz      │   │ + MQTT  │ │
│  └──────────────┘   └──────────────┘   └────────────┘   └─────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 分层职责

| 层级 | 技术选型 | 职责 |
|------|----------|------|
| **硬件层** | ESP32 + DHT22 + VS1838 | 数据采集、红外码学习与发射 |
| **通信层** | EMQX 本地 Broker + 云端 Broker | 设备接入（本地）、远程访问（云端）、桥接同步 |
| **后端层** | NestJS + LangChain.js | 业务编排、AI 决策、数据持久化、WS 推送 |
| **前端层** | React 19 + R3F + Zustand | 3D 渲染、状态管理、用户交互 |

### 3.3 本地 vs 远程场景对照

| 场景 | 数据路径 | 延迟 | 依赖互联网 |
|------|----------|:----:|:----------:|
| 🏠 在家操作 | ESP32 ↔ **本地 Broker** ↔ React 前端 | <10ms | ❌ 不需要 |
| 📱 远程查看 | ESP32 → 本地 Broker → **云端 Broker** → App | <200ms | ✅ 需要 |
| 🤖 AI 分析 | 本地 Broker → 云端 Broker → **NestJS + LangChain** | <100ms | ✅ 需要 |
| 🚨 断网容灾 | ESP32 ↔ **本地 Broker**（阈值模式） | <10ms | ❌ 不需要 |
| 📊 数据分析 | 云端 Broker → InfluxDB → 历史查询 API | - | ✅ 需要 |

---

## 4. 网络拓扑与部署架构

### 4.1 物理网络拓扑

```
                         ☁️ 互联网 / 公网
                              │
                    ┌─────────▼─────────┐
                    │   云端 EMQX Broker │  (阿里云/腾讯云/EMQX Cloud)
                    │   cloud.emqx.io   │
                    │  端口: 1883 (TLS) │
                    └─────────┬─────────┘
                             │ MQTT Bridge (TLS)
                             │ 双向同步 house/room/#
                    ┌─────────▼─────────┐
                    │   家庭路由器 / 网关  │
                    │   端口转发 1883 →   │
                    │   本地服务器         │
                    └─────────┬─────────┘
                             │ LAN (192.168.x.x / 10.0.0.x)
         ┌───────────────────┼───────────────────────┐
         │                   │                       │
         ▼                   ▼                       ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐
│ 🏠 本地 EMQX     │  │ NestJS 服务器    │  │ 树莓派 / NAS        │
│ Broker (Docker)  │  │ (可选独立机器)    │  │ Docker 宿主机       │
│ 端口 1883/8083   │  │ LangChain Agent  │  │ 跑: EMQX + DB       │
│ + Redis 缓存     │  │ WebSocket 网关   │  └─────────────────────┘
└────────┬─────────┘  └─────────────────┘
         │ WiFi 2.4G
    ┌────┴────┬────┬────┐
    ▼         ▼    ▼    ▼
 客厅ESP32   卧室  书房  厨房
   DHT22    ESP32 ESP32 ESP32
```

### 4.2 Docker 部署拓扑

```yaml
# docker-compose.yml — 本地服务器运行
version: '3.8'

services:
  # ── 本地 MQTT Broker（设备接入 + 前端实时订阅）──
  emqx-local:
    image: emqx:5.8
    ports:
      - "1883:1883"      # TCP-MQTT ← ESP32 设备连接
      - "8083:8083"      # WS-MQTT  ← React 前端连接
      - "18083:18083"    # Dashboard 管理界面
    volumes:
      - ./emqx-cluster.conf:/opt/emqx/etc/emqx.conf
    environment:
      EMQX_DASHBOARD__DEFAULT_PASSWORD: "${LOCAL_BROKER_PW}"

  # ── 本地缓存（断电时暂存最新数据，网络恢复后同步到云端）──
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # ── 本地时序数据库（短期存储 + 历史趋势）──
  influxdb:
    image: influxdb:2.7
    ports:
      - "8086:8086"
    volumes:
      - influxdata:/var/lib/influxdb2

volumes:
  influxdata:
```

### 4.3 云端部署拓扑（EMQX Cloud / 阿里云）

```
┌──────────────────────────────────────────────────┐
│              云端集群 (Kubernetes)                 │
│                                                    │
│  ┌──────────┐   ┌──────────┐   ┌──────────────┐  │
│  │ EMQX     │←──│ EMQX     │──▶│ 云端 Load     │  │
│  │ Broker 1 │──▶│ Broker 2 │   │ Balancer      │  │
│  └──────────┘   └──────────┘   └──────┬───────┘  │
│                                        │          │
│  ┌────────────────────────────────┐    │          │
│  │ NestJS + LangChain Agent      │◀───┘          │
│  │ (Pod)                         │                │
│  └────────────┬───────────────────┘               │
│               │                                   │
│  ┌────────────▼────────────┐  ┌────────────────┐ │
│  │ PostgreSQL (RDS)        │  │ InfluxDB Cloud │ │
│  │ 用户/设备/配置/决策日志  │  │ 时序长期存储    │ │
│  └─────────────────────────┘  └────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 4.4 MQTT Bridge 配置

本地 Broker 和云端 Broker 之间通过 MQTT Bridge 双向同步：

```bash
# EMQX Bridge 配置 — 本地 Broker → 云端 Broker
# 方式 1：EMQX Dashboard 可视化配置
# 方式 2：emqx.conf 配置文件

bridges.mqtt.cloud {
  server   = "ssl://cloud.emqx.io:8883"
  clientid = "local_bridge_1"
  username = "${CLOUD_BROKER_USER}"
  password = "${CLOUD_BROKER_PASS}"

  # 桥接方向：本地 → 云端
  ingress {
    topic = "house/room/+/data"
    qos   = 1
  }

  # 桥接方向：云端 → 本地
  egress {
    topic = "house/room/+/ac/ctrl"
    qos   = 1
  }
}
```

### 4.5 网络策略总结

| 方向 | 协议 | 源 | 目标 | 端口 | 备注 |
|------|------|:--:|:----:|:----:|------|
| 设备上报 | TCP-MQTT | ESP32 | 本地 Broker | 1883 | 内网直连 |
| ESP32 上云 | TCP-MQTT | ESP32 | 云端 Broker | 8883 (TLS) | 可选，双连接 |
| 前端订阅 | WS-MQTT | 浏览器 | 本地 Broker | 8083 | 局域网 |
| 远程前端 | WS-MQTT | 浏览器 | 云端 Broker | 8084 (WSS) | 因特网 |
| Broker 桥接 | TCP-MQTT/TLS | 本地 Broker | 云端 Broker | 8883 | Bridging |
| NestJS 接入 | TCP-MQTT | NestJS Pod | 云端 Broker | 1883 | 云端内网 |

---

## 5. 项目目录结构

采用 **Monorepo** 组织方式，统一管理前后端代码：

```
smart-home-iot/
├── package.json                    # 工作区根配置 (pnpm workspaces)
├── pnpm-workspace.yaml
├── docker-compose.yml              # 本地 EMQX + Redis + InfluxDB
├── docker-compose.cloud.yml        # 云端 NestJS + Agent + DB
│
├── apps/
│   ├── server/                     # NestJS 后端
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/             # 环境配置（本地/云端 Broker 地址）
│   │   │   │   ├── broker.config.ts
│   │   │   │   └── env.validation.ts
│   │   │   ├── mqtt/               # MQTT 微服务消费者
│   │   │   │   ├── mqtt.module.ts
│   │   │   │   ├── mqtt.service.ts
│   │   │   │   └── dto/
│   │   │   ├── room/               # 房间领域模块
│   │   │   │   ├── room.module.ts
│   │   │   │   ├── room.controller.ts
│   │   │   │   ├── room.service.ts
│   │   │   │   └── schemas/
│   │   │   ├── gateway/            # WebSocket/SSE 网关
│   │   │   │   ├── gateway.module.ts
│   │   │   │   └── room.gateway.ts
│   │   │   ├── agent/              # LangChain AI Agent
│   │   │   │   ├── agent.module.ts
│   │   │   │   ├── agent.service.ts
│   │   │   │   ├── tools/          # LangChain 工具定义
│   │   │   │   │   ├── env.tool.ts
│   │   │   │   │   ├── ac.tool.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── graph/          # LangGraph 工作流
│   │   │   │       └── thermostat.graph.ts
│   │   │   ├── influx/             # 时序数据库适配
│   │   │   └── common/             # 共享类型/工具
│   │   ├── test/
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── client/                     # React 前端
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   │   ├── Scene/          # React Three Fiber 3D 场景
│   │   │   │   │   ├── House.tsx
│   │   │   │   │   ├── Room.tsx
│   │   │   │   │   ├── TemperatureBlock.tsx
│   │   │   │   │   └── AcUnit.tsx
│   │   │   │   ├── Panel/          # 控制面板
│   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   ├── TempChart.tsx
│   │   │   │   │   └── DeviceCard.tsx
│   │   │   │   └── Common/
│   │   │   ├── hooks/              # 自定义 Hooks
│   │   │   │   ├── useMqtt.ts
│   │   │   │   ├── useSensorData.ts
│   │   │   │   └── useAiDecision.ts
│   │   │   ├── store/              # Zustand 状态管理
│   │   │   │   ├── sensorStore.ts
│   │   │   │   ├── deviceStore.ts
│   │   │   │   └── aiStore.ts
│   │   │   ├── services/           # API 调用
│   │   │   │   ├── mqtt.service.ts
│   │   │   │   └── api.service.ts
│   │   │   ├── types/              # TypeScript 类型
│   │   │   │   ├── sensor.ts
│   │   │   │   ├── room.ts
│   │   │   │   └── ai.ts
│   │   │   └── utils/
│   │   │       └── temperature.ts
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── shared/                     # 共享类型包
│       ├── src/
│       │   ├── types/
│       │   │   ├── sensor.types.ts
│       │   │   ├── mqtt-topics.ts
│       │   │   └── ac.types.ts
│       │   └── constants/
│       └── package.json
│
├── deploy/
│   ├── docker-compose.local.yml    # 本地部署
│   ├── docker-compose.cloud.yml    # 云端部署
│   └── k8s/                        # Kubernetes 编排
│       ├── nestjs-deployment.yaml
│       └── emqx-bridge.yaml
│
├── docs/                           # 文档
└── firmware/                       # ESP32 Arduino 固件
    ├── smart-thermostat/
    │   ├── smart-thermostat.ino
    │   ├── wifi.h                  # WiFi 连接管理
    │   ├── mqtt.h                  # MQTT 双 Broker 连接
    │   └── ir.h                    # 红外控制
    └── platformio.ini
```

---

## 6. 硬件层 — ESP32 物联网终端

### 6.1 硬件选型

| 组件 | 型号/规格 | 接口 | 用途 |
|------|-----------|------|------|
| 主控芯片 | **ESP32-WROOM-32** (Type-C) | WiFi 2.4G + BLE | 联网、数据处理、红外控制 |
| 温湿度传感器 | **DHT22** (AM2302) | 单总线 GPIO | ±0.5°C 精度温湿度采集 |
| 红外接收头 | **VS1838** | 38KHz 载波 GPIO | 学习空调遥控码值 |
| 红外发射管 | **38KHz 红外 LED** | PWM GPIO | 模拟遥控器发射信号 |
| 电源 | **5V/2A Type-C** | USB | 为 ESP32 及外设供电 |

### 6.2 硬件工作流程

```
┌───────────────────────────────────────────────────────────────────┐
│                        ESP32 固件主循环                             │
│                                                                   │
│  ┌──────────────┐     ┌───────────────┐     ┌──────────────┐     │
│  │ DHT22 采集    │────▶│ MQTT 发布      │────▶│ 深度睡眠     │     │
│  │ 每 30s 一次   │     │ 本地 Broker    │     │ 功耗优化     │     │
│  └──────────────┘     │ 云端 Broker    │     └──────────────┘     │
│                       └──────┬────────┘                          │
│                              │                                    │
│  ┌──────────────┐     ┌──────▼────────┐                          │
│  │ MQTT 订阅回调  │◀───│ 双 Broker 订阅 │                          │
│  │ topic: ctrl   │     │ 本地+云端     │                          │
│  └──────┬───────┘     └───────────────┘                          │
│         ▼                                                         │
│  ┌──────────────┐     ┌──────────────┐                           │
│  │ VS1838 学习   │────▶│ 38KHz 发射    │──▶ 空调                   │
│  │ 红外码        │     │ 红外信号      │                           │
│  └──────────────┘     └──────────────┘                           │
└───────────────────────────────────────────────────────────────────┘
```

### 6.3 固件核心流程

1. **ESP32 + DHT22 数据采集**
   - WiFi 联网 → TCP-MQTT 同时连接**本地 Broker** 和**云端 Broker**
   - 每 30s 采集温湿度，双通道发布到 `house/room/{id}/data`
   - 支持 deep sleep 模式，电池供电场景优化功耗

2. **ESP32 + 红外控制空调**
   - 同时订阅本地和云端 Broker 的 `house/room/{id}/ac/ctrl`
   - VS1838 学习空调遥控码（首次配置）
   - 38KHz 红外发射管模拟遥控器信号

3. **本地容灾逻辑（关键）**
   - WiFi 断连 → 自动转到本地阈值模式
   - 云端 Broker 断连 → **本地 Broker 继续服务**，不受影响
   - 全部断网 → ESP32 本地阈值控制（<22°C 停止制冷 / >30°C 紧急制冷）
   - 网络恢复 → 自动重连，同步离线期间数据到云端

### 6.4 固件 MQTT 双连接策略

```cpp
// mqtt.h — ESP32 双 Broker 连接管理
class MqttManager {
private:
  WiFiClient localClient;
  WiFiClientSecure cloudClient;  // TLS 加密连接云端
  PubSubClient localMqtt;
  PubSubClient cloudMqtt;

  // Broker 地址配置
  const char* LOCAL_BROKER  = "192.168.1.100";  // 本地服务器 IP
  const char* CLOUD_BROKER  = "cloud.emqx.io";   // 云端域名
  const int   LOCAL_PORT    = 1883;
  const int   CLOUD_PORT    = 8883;               // TLS 端口

public:
  void setup() {
    // 本地 — 明文，低延迟
    localMqtt.setServer(LOCAL_BROKER, LOCAL_PORT);
    localMqtt.setCallback(onLocalMessage);

    // 云端 — TLS 加密
    cloudMqtt.setServer(CLOUD_BROKER, CLOUD_PORT);
    cloudMqtt.setCallback(onCloudMessage);
    cloudClient.setCACert(emqx_ca_cert);  // CA 证书
  }

  bool maintain() {
    bool l = localMqtt.connected();
    bool c = cloudMqtt.connected();

    // 至少连上一个就算正常
    if (!l || !c) {
      if (!l) reconnectLocal();   // 重连本地
      if (!c) reconnectCloud();   // 重连云端
    }
    localMqtt.loop();
    cloudMqtt.loop();

    // 返回 true 表示至少有一个连接正常
    return localMqtt.connected() || cloudMqtt.connected();
  }

  void publish(const char* topic, const char* payload) {
    if (localMqtt.connected()) localMqtt.publish(topic, payload);
    if (cloudMqtt.connected()) cloudMqtt.publish(topic, payload);
  }
};
```

### 6.5 固件关键依赖 (PlatformIO)

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
lib_deps =
    knolleary/PubSubClient
    adafruit/DHT sensor library@^1.4.4
    crankyoldgit/IRremoteESP8266@^2.8.6
    bblanchon/ArduinoJson@^7.0.3
```

---

## 7. 通信层 — MQTT 双 Broker 架构

### 7.1 为什么需要双 Broker？

| 场景 | 单 Broker 问题 | 双 Broker 方案 |
|------|---------------|---------------|
| 🌐 互联网断连 | 全屋设备不可控 | 本地 Broker 独立运行，断网不受影响 |
| 📱 远程访问 | 外网无法连回家 | 云端 Broker 固定域名，随时随地接入 |
| 🚀 响应速度 | 云端转一圈延迟 >200ms | 本地 Broker <10ms 直接响应 |
| 💾 数据备份 | 本地宕机历史数据丢失 | 云端自动同步，异地备份 |
| 🔄 蓝绿部署 | 重启 Broker 会导致设备断连 | 双 Broker 交替升级，无缝切换 |

### 7.2 双 Broker 架构设计

```
┌─────────────────────────────────────────────────────────────────────┐
│                      双 Broker 逻辑架构                               │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │                    MQTT 主题空间                         │       │
│   │                     house/room/#                        │       │
│   └────────────┬───────────────────────────┬────────────────┘       │
│                │                           │                        │
│                ▼                           ▼                        │
│   ┌───────────────────────┐   ┌───────────────────────────┐        │
│   │ 🏠 本地 Broker         │   │ ☁️ 云端 Broker             │        │
│   │                       │   │                           │        │
│   │ 角色：设备接入 + 前端   │   │ 角色：远程访问 + AI 计算   │        │
│   │     实时控制           │   │     数据持久化 + 告警      │        │
│   │                       │   │                           │        │
│   │ 位置：家庭服务器        │   │ 位置：EMQX Cloud / 阿里云  │        │
│   │ Docker 容器            │   │ Kubernetes 集群           │        │
│   │                       │   │                           │        │
│   │ 节点：单节点            │   │ 节点：多节点集群            │        │
│   │ 高可用：宿主机依赖       │   │ 高可用：自动故障转移        │        │
│   └───────────────────────┘   └───────────────────────────┘        │
│                │                           │                        │
│                └─────────── 桥接 ──────────┘                        │
│                   双向同步 house/room/#                             │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.3 Broker 配置对比

| 配置项 | 🏠 本地 Broker | ☁️ 云端 Broker |
|--------|---------------|----------------|
| 地址 | `192.168.1.100:1883` | `cloud.emqx.io:8883` |
| 协议 | TCP / WebSocket | TCP + TLS / WSS |
| 认证 | 简单密码 / IP 白名单 | JWT / X.509 证书 |
| 存储 | Mnesia + Redis 缓存 | Mnesia + PostgreSQL 持久化 |
| 规则引擎 | 本地数据分流 | 数据写入 InfluxDB |
| 告警 | 无 | WebHook → 钉钉/飞书/邮件 |
| 高可用 | 宿主机守护进程 | EMQX Cluster + LB |

### 7.4 离线与容灾策略

```
时间线 ────────────────────────────────────────────────────────────────┐
                                                                      │
  🟢 正常状态                                                        │
  ┌─────────────────────────────────────────────────────────────┐     │
  │ ESP32 ──▶ 本地 Broker ──Bridge──▶ 云端 Broker ──▶ AI + DB      │     │
  │        ──▶ 前端 (WS)              │                          │     │
  └─────────────────────────────────────────────────────────────┘     │
                                                                      │
  🟡 互联网断连                                                      │
  ┌─────────────────────────────────────────────────────────────┐     │
  │ ESP32 ──▶ 本地 Broker ──(Bridge 断线)──▶ 云端 Broker ✗         │     │
  │        ──▶ 前端 (正常显示)  ◀── 本地完全可用 ──▶            │     │
  │        ▶ 本地缓存数据到 Redis                                  │     │
  │        ▶ AI 降级：本地阈值控制                                   │     │
  └─────────────────────────────────────────────────────────────┘     │
                                                                      │
  🔴 完全断网（路由器/光猫故障）                                      │
  ┌─────────────────────────────────────────────────────────────┐     │
  │ ESP32 ──▶ 本地 Broker ──(无互联网)                           │     │
  │        ▶ 局域网内前端正常                                     │     │
  │        ▶ AI 降级 → ESP32 本机阈值                                 │     │
  │        ▶ 超过 30°C 自动制冷 / 低于 18°C 自动制热               │     │
  └─────────────────────────────────────────────────────────────┘     │
                                                                      │
  🟢 网络恢复                                                        │
  ┌─────────────────────────────────────────────────────────────┐     │
  │ 1. 本地 Broker 重连云端 Bridge                                  │     │
  │ 2. Redis → 云端 Broker 同步离线数据                              │     │
  │ 3. AI Agent 重新接管决策权                                      │     │
  │ 4. 用户收到推送："系统已恢复在线模式"                             │     │
  └─────────────────────────────────────────────────────────────┘     │
```

### 7.5 Broker 选型

| 产品 | 适用位置 | 部署方式 | 推荐理由 |
|------|---------|---------|----------|
| **EMQX** (开源版) | 🏠 本地 | Docker 单节点 | 国产、高性能、规则引擎强大、Dashboard 友好 |
| **EMQX Cloud** | ☁️ 云端 | SaaS / BYOC | 全托管、免运维、全球节点、TLS 开箱即用 |
| Mosquitto | 🏠 轻量本地 | Docker / apt | 资源占用极低（树莓派 Zero 都能跑） |

> 💡 **推荐组合**：本地用 EMQX 开源版（规则引擎+桥接），云端用 EMQX Cloud（托管省心）或自建 EMQX 集群。

### 7.6 MQTT 主题设计 (Topic)

| 方向 | Topic | QoS | 说明 | 同步范围 |
|------|-------|:---:|------|:--------:|
| ⬆ 上报 | `house/room/{roomId}/data` | 1 | 温湿度传感器数据 | 本地 + 云端 |
| ⬆ 上报 | `house/room/{roomId}/status` | 2 | 设备在线/离线/故障状态 | 本地 + 云端 |
| ⬆ 上报 | `house/room/{roomId}/ac/power` | 1 | 空调电源启停状态 | 仅本地 |
| ⬇ 下发 | `house/room/{roomId}/ac/ctrl` | 1 | 空调控制指令（AI / 手动） | 本地 + 云端 |
| ⬇ 下发 | `house/room/{roomId}/config` | 2 | 设备参数配置 | 仅本地 |
| ⬇ 下发 | `house/room/{roomId}/sync` | 1 | 离线同步指令 | 本地 ← 云端 |
| 🔄 内部 | `house/agent/decision` | 1 | AI 决策日志（推前端） | 仅云端 |

> **同步策略**：高频上报和控类指令走双端同步，配置类和管理类走单端，减少不必要的桥接流量。

### 7.7 JSON 数据协议

#### 传感器上报

```json
{
  "deviceId": "room_living",
  "type": "sensor",
  "temp": 26.5,
  "humi": 48.2,
  "heatIndex": 27.1,
  "battery": 85,
  "rssi": -62,
  "broker": "local",      // 标识来自哪个 Broker
  "status": "online",
  "timestamp": "2026-07-17 20:00:00"
}
```

#### AI 控制指令下发

```json
{
  "deviceId": "room_living",
  "type": "command",
  "action": "ac_control",
  "payload": {
    "power": "on",
    "mode": "cool",
    "targetTemp": 26,
    "fanSpeed": "auto",
    "swing": false
  },
  "source": "ai_agent",
  "viaBroker": "cloud",   // 经云端→桥接→本地→ESP32
  "reason": "室温 30.2°C，已超过舒适阈值，自动开启制冷",
  "timestamp": "2026-07-17 20:00:05"
}
```

---

## 8. 后端层 — NestJS 服务端

### 8.1 技术选型明细

| 包名 | 用途 |
|------|------|
| `@nestjs/core` + `@nestjs/platform-express` | 核心框架 |
| `@nestjs/microservices` (MQTT 策略) | MQTT 消费者 |
| `@nestjs/platform-socket.io` / `@nestjs/websockets` | WebSocket 推送到前端 |
| `@langchain/core` + `@langchain/openai` | LangChain AI 框架 |
| `@langchain/langgraph` | Agent 工作流编排 |
| `influxdb-client` | 时序数据存储 |
| `prisma` + `postgresql` | 关系数据存储 |

### 8.2 NestJS 核心模块设计

```
app.module.ts (NestJS 部署在云端，连接到云端 Broker)
├── ConfigModule              ← 读取环境变量（Broker 地址/密钥）
│
├── MqttModule                ← 连接云端 EMQX，订阅设备主题
│   └── MqttService           ← 处理消息、解码、触发业务逻辑
│
├── RoomModule                ← 房间与设备领域
│   ├── RoomController        ← REST API（供前端查询）
│   └── RoomService           ← 业务逻辑
│
├── GatewayModule             ← WebSocket 实时推送
│   └── RoomGateway           ← 向前端广播设备状态变化
│
├── AgentModule               ← LangChain AI Agent
│   ├── AgentService          ← Agent 编排入口
│   ├── tools/                ← StructuredTool 定义
│   └── graph/                ← LangGraph 温控工作流
│
└── InfluxModule              ← 时序数据库适配
```

### 8.3 NestJS 接入双 Broker 策略

```typescript
// mqtt.module.ts — NestJS 连接到云端 Broker
// （云端 Broker 通过 Bridge 自动接收本地 Broker 的数据，
//   NestJS 不需要另外直连本地 Broker）
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MQTT_CLIENT',
        transport: Transport.MQTT,
        options: {
          url: 'mqtts://cloud.emqx.io:8883',  // TLS 加密连接
          username: 'nestjs',
          password: process.env.CLOUD_MQTT_PASSWORD,
          clientId: `nest_server_${randomUUID()}`,
        },
      },
    ]),
  ],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
```

```typescript
// mqtt.service.ts — 订阅所有房间数据 + 触发 AI
@Injectable()
export class MqttService implements OnModuleInit {
  constructor(
    @Inject('MQTT_CLIENT') private client: ClientProxy,
    @InjectModel(RoomData.name) private roomDataModel: Model<RoomData>,
    private readonly roomGateway: RoomGateway,
    private readonly agentService: AgentService,
  ) {}

  async onModuleInit() {
    this.client.connect().subscribe(() => {
      // 订阅设备上报（本地 Broker 会桥接过来）
      this.client.emit('subscribe', 'house/room/+/data');
      this.client.emit('subscribe', 'house/room/+/status');
    });
  }

  @EventPattern('house/room/+/data')
  async handleSensorData(data: Record<string, unknown>) {
    const payload = data as SensorDataPayload;

    // 1. 持久化到时序数据库（云端写入）
    await this.roomDataModel.create(payload);

    // 2. 推送到前端（通过 WebSocket）
    this.roomGateway.broadcastRoomData(payload);

    // 3. 触发 AI Agent 评估（如果温度异常）
    if (payload.temp > 30 || payload.temp < 18) {
      await this.agentService.evaluateRoom(payload.deviceId);
    }
  }

  // AI 控制指令通过 MQTT 下发
  async sendCommand(roomId: string, command: AcCommand) {
    const payload = {
      deviceId: roomId,
      type: 'command',
      action: 'ac_control',
      payload: command,
      source: 'ai_agent',
      viaBroker: 'cloud',
      timestamp: new Date().toISOString(),
    };

    // 发布到云端 Broker
    // → 云端 Bridge 自动转发到本地 Broker
    // → 本地 Broker 推送给 ESP32
    await this.client.emit('publish', {
      topic: `house/room/${roomId}/ac/ctrl`,
      payload: JSON.stringify(payload),
      qos: 1,
    });

    // 同时通知前端
    this.roomGateway.broadcastAiDecision(payload);
  }
}
```

### 8.4 WebSocket 实时推送

```typescript
// room.gateway.ts
@WebSocketGateway({
  namespace: '/rooms',
  cors: { origin: process.env.CLIENT_URL },
})
export class RoomGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const roomId = client.handshake.query.roomId as string;
    if (roomId) client.join(`room:${roomId}`);
  }

  broadcastRoomData(data: SensorDataPayload) {
    // 推送到指定房间 + 全屋广播
    this.server.to(`room:${data.deviceId}`).emit('sensor:update', data);
    this.server.emit('sensor:global', data);
  }

  broadcastAiDecision(decision: AiDecisionPayload) {
    this.server.emit('ai:decision', decision);
  }
}
```

### 8.5 REST API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/rooms` | 获取全屋房间列表 |
| `GET` | `/api/rooms/:id/data?range=1h` | 获取房间历史数据 |
| `GET` | `/api/rooms/:id/status` | 获取房间当前状态 |
| `POST` | `/api/rooms/:id/ac/control` | 手动控制空调 |
| `GET` | `/api/agent/decisions` | 获取 AI 决策历史 |
| `PUT` | `/api/agent/preferences` | 设置用户偏好 |
| `GET` | `/api/system/health` | 系统健康检查（Broker 连接状态） |

---

## 9. 前端层 — React + React Three Fiber 3D 可视化

### 9.1 技术选型明细

| 包名 | 用途 |
|------|------|
| `react` + `react-dom` 19 | UI 框架 |
| `@react-three/fiber` | React 声明式 Three.js 渲染器 |
| `@react-three/drei` | R3F 实用工具集（OrbitControls, Text 等） |
| `three` | WebGL 3D 引擎 |
| `mqtt` (mqtt.js) | WebSocket-MQTT 客户端 |
| `zustand` | 轻量状态管理 |
| `antd` + `@ant-design/icons` | UI 组件库 |
| `@tanstack/react-query` | 服务端状态缓存 |
| `recharts` / `lightweight-charts` | 实时数据曲线 |

### 9.2 React 组件树

```
<App>
├── <MqttProvider>              ← mqtt.js 连接（默认连本地 Broker）
│   ├── <MqttHealthIndicator /> ← 显示当前连接到哪个 Broker
│   ├── <Layout>
│   │   ├── <Sidebar>
│   │   │   ├── <RoomList />    ← 房间列表
│   │   │   ├── <MqttStatus />  ← 连接状态（本地/云端/离线）
│   │   │   └── <AiStatus />    ← AI 模式指示
│   │   │
│   │   ├── <Scene3D>           ← 主场景 (Canvas)
│   │   │   ├── <House />       ← 全屋外壳模型
│   │   │   │   ├── <Room position={vec3}>
│   │   │   │   │   ├── <TemperatureBlock />  ← 温度着色方块
│   │   │   │   │   ├── <AcUnit />            ← 空调设备模型
│   │   │   │   │   ├── <ConnectionBadge />   ← Broker 连接状态标记
│   │   │   │   │   └── <Label />             ← 温度/湿度文字
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── <Lighting />    ← 环境光/点光源
│   │   │   ├── <OrbitControls /> ← 鼠标交互控制
│   │   │   └── <Effects />     ← 后处理特效（辉光等）
│   │   │
│   │   └── <Panel>             ← 右侧控制面板
│   │       ├── <RoomDetail />  ← 选中房间详情
│   │       ├── <TempChart />   ← 实时温度曲线
│   │       ├── <DeviceCard />  ← 设备控制卡片
│   │       ├── <AiDecisionLog /> ← AI 决策日志
│   │       └── <BrokerSelector /> ← 手动切换 Broker 连接
│   │
│   └── <Toast />               ← 全局通知
```

### 9.3 前端 MQTT 双 Broker 连接

```typescript
// hooks/useMqtt.ts — 前端支持连接本地或云端 Broker
interface MqttConfig {
  url: string;
  protocol: 'ws' | 'wss';
  label: string;
}

const BROKERS: Record<'local' | 'cloud', MqttConfig> = {
  local: {
    url: 'ws://192.168.1.100:8083/mqtt',
    protocol: 'ws',
    label: '🏠 本地 Broker',
  },
  cloud: {
    url: 'wss://cloud.emqx.io:8084/mqtt',
    protocol: 'wss',
    label: '☁️ 云端 Broker',
  },
};

export function useMqtt() {
  const [connectedBroker, setConnectedBroker] = useState<'local' | 'cloud' | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const clientRef = useRef<MqttClient | null>(null);
  const updateRoom = useSensorStore((s) => s.updateRoom);
  const addDecision = useAiStore((s) => s.addDecision);

  const connect = useCallback((target: 'local' | 'cloud') => {
    // 断开旧连接
    if (clientRef.current) clientRef.current.end();

    const config = BROKERS[target];
    const client = mqtt.connect(config.url, {
      clientId: `web_client_${navigator.userAgent.substring(0, 8)}`,
      connectTimeout: 5000,
    });

    client.on('connect', () => {
      setConnectedBroker(target);
      setStatus('connected');
      client.subscribe('house/room/+/data');
      client.subscribe('house/agent/decision');
    });

    client.on('message', (topic, payload) => {
      const data = JSON.parse(payload.toString());
      if (topic.includes('/data')) updateRoom(data.deviceId, data);
      if (topic.includes('/decision')) addDecision(data);
    });

    client.on('disconnect', () => setStatus('disconnected'));
    client.on('offline', () => setStatus('disconnected'));

    clientRef.current = client;
  }, []);

  // 自动连接：优先连本地，失败则连云端
  useEffect(() => {
    connect('local');
    // 如果 5s 连不上本地，自动切换云端
    const timer = setTimeout(() => {
      if (status === 'disconnected') {
        console.warn('本地 Broker 不可达，切换到云端 Broker');
        connect('cloud');
      }
    }, 5000);
    return () => {
      clearTimeout(timer);
      clientRef.current?.end();
    };
  }, []);

  return { connectedBroker, status, connect };
}
```

```typescript
// hooks/useSensorData.ts — 直接读取本地 Broker 缓存的实时数据
export function useSensorData(roomId: string) {
  return useSensorStore((s) => s.rooms.get(roomId));

  // ✅ 走本地 Broker，毫秒级更新
  // ❌ 不需要经过 NestJS REST API，减少延迟
}

// hooks/useHistoryData.ts — 历史趋势走 REST API
export function useHistoryData(roomId: string, range: string) {
  // ✅ 历史数据走 NestJS API（读取 InfluxDB）
  // ❌ MQTT 只推实时，不推历史
  return useQuery({
    queryKey: ['roomHistory', roomId, range],
    queryFn: () => apiService.getRoomHistory(roomId, range),
  });
}
```

### 9.4 核心 3D 场景组件

```tsx
// Scene/House.tsx — 全屋 3D 场景
export function House() {
  const rooms = useSensorStore((s) => s.rooms);
  const model = useGLTF('/models/house.glb');

  return (
    <group>
      {Array.from(rooms.entries()).map(([id, room]) => (
        <Room
          key={id}
          position={room.position}
          size={room.size}
          data={room}
        />
      ))}
    </group>
  );
}

// Scene/Room.tsx — 单房间
function Room({ position, size, data }: RoomProps) {
  const color = getTemperatureColor(data.temp);

  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        opacity={0.8}
        transparent
        emissive={color}
        emissiveIntensity={data.status === 'online' ? 0.2 : 0}
      />
      {/* 温度标签 */}
      <Text position={[0, size[1] / 2 + 0.3, 0]} fontSize={0.4}>
        {`${data.temp}°C`}
      </Text>

      {/* 当前连接的 Broker 标记 */}
      {data.broker === 'cloud' && (
        <CloudBadge position={[size[0] / 2 + 0.2, size[1] / 2, 0]} />
      )}

      {/* AI 决策中动画 */}
      {data.aiActive && <EffectRing position={[0, 0, 0]} />}
    </mesh>
  );
}
```

### 9.5 温度颜色映射

```typescript
// utils/temperature.ts
export function getTemperatureColor(temp: number): string {
  if (temp < 18) return '#2196F3';   // ❄️ 蓝色 — 过冷
  if (temp < 22) return '#4FC3F7';   // 💧 浅蓝 — 偏凉
  if (temp <= 26) return '#4CAF50';  // 🌿 绿色 — 舒适
  if (temp <= 30) return '#FF9800';  // ⚠️ 橙色 — 偏热
  return '#F44336';                   // 🔥 红色 — 过热
}
```

### 9.6 Zustand 状态管理

```typescript
// store/sensorStore.ts
interface SensorState {
  rooms: Map<string, RoomSensorData>;
  brokerHealth: { local: boolean; cloud: boolean };
  updateRoom: (id: string, data: SensorDataPayload) => void;
  setBrokerHealth: (broker: 'local' | 'cloud', online: boolean) => void;
  globalStats: {
    avgTemp: number;
    avgHumi: number;
    onlineCount: number;
    activeBroker: 'local' | 'cloud' | 'none';
  };
}

export const useSensorStore = create<SensorState>((set, get) => ({
  rooms: new Map(),
  brokerHealth: { local: true, cloud: true },
  globalStats: { avgTemp: 0, avgHumi: 0, onlineCount: 0, activeBroker: 'local' },

  updateRoom: (id, data) => {
    set((state) => {
      const rooms = new Map(state.rooms);
      rooms.set(id, {
        ...rooms.get(id),
        ...data,
        lastUpdate: Date.now(),
      });
      return { rooms, globalStats: computeGlobalStats(rooms) };
    });
  },

  setBrokerHealth: (broker, online) => {
    set((state) => ({
      brokerHealth: { ...state.brokerHealth, [broker]: online },
    }));
  },
}));
```

---

## 10. AI 层 — LangChain.js Agent 温控引擎

### 10.1 技术选型

| 包名 | 用途 |
|------|------|
| `@langchain/core` | 基类：工具定义、消息模型 |
| `@langchain/openai` | OpenAI / 兼容模型接入 |
| `@langchain/langgraph` | Agent 工作流编排（状态图） |
| `@langchain/community` | 社区工具集成 |

### 10.2 StructuredTool 定义

```typescript
// agent/tools/env.tool.ts
export class GetRoomEnvTool extends StructuredTool {
  name = 'get_room_env';
  description = '获取指定房间的温湿度环境数据';

  schema = z.object({
    roomId: z.string().describe('房间 ID，如 room_living, room_bedroom'),
  });

  constructor(private roomService: RoomService) {
    super();
  }

  async _call({ roomId }: z.infer<typeof this.schema>) {
    const data = await this.roomService.getLatestData(roomId);
    return JSON.stringify(data);
  }
}
```

```typescript
// agent/tools/ac.tool.ts
export class ControlAcTool extends StructuredTool {
  name = 'control_aircon';
  description = '控制指定房间的空调：开关机、调温、调模式';

  schema = z.object({
    roomId: z.string(),
    power: z.enum(['on', 'off']),
    mode: z.enum(['cool', 'heat', 'fan', 'auto']).optional(),
    targetTemp: z.number().min(16).max(30).optional(),
    fanSpeed: z.enum(['low', 'mid', 'high', 'auto']).optional(),
  });

  constructor(
    private mqttService: MqttService,
    private roomGateway: RoomGateway,
  ) {
    super();
  }

  async _call(input: z.infer<typeof this.schema>) {
    // 通过 MqttService 下发到云端 Broker
    // → 云端 Bridge → 本地 Broker → ESP32
    await this.mqttService.sendCommand(input.roomId, input);

    return `已执行：${input.roomId} 空调已${input.power === 'on' ? '开启' : '关闭'}`;
  }
}
```

### 10.3 LangGraph 温控工作流

```typescript
// agent/graph/thermostat.graph.ts
import { StateGraph, END } from '@langchain/langgraph';

interface ThermostatState {
  rooms: RoomEnvData[];
  decisions: AiDecision[];
  userPreferences: UserPrefs;
  iterationCount: number;
}

const workflow = new StateGraph<ThermostatState>({
  channels: {
    rooms: { value: (a, b) => b, default: () => [] },
    decisions: { value: (a, b) => [...a, ...b], default: () => [] },
    userPreferences: { value: (a, b) => b },
    iterationCount: { value: (a, b) => a + b, default: () => 0 },
  },
});

// 节点 1：获取全屋数据
workflow.addNode('collect_data', async (state) => {
  const data = await Promise.all(
    state.rooms.map((r) => roomService.getLatestData(r.id)),
  );
  return { rooms: data };
});

// 节点 2：AI 分析决策
workflow.addNode('analyze', async (state) => {
  const decisions = await agent.invoke({
    messages: [
      systemPrompt(state.userPreferences),
      humanMessage(formatRoomData(state.rooms)),
    ],
  });
  return { decisions: parseDecisions(decisions) };
});

// 节点 3：执行控制
workflow.addNode('execute', async (state) => {
  for (const decision of state.decisions) {
    await controlAcTool._call(decision.command);
  }
  return {};
});

// 条件边：允许 AI 最多评估 3 轮
workflow.addConditionalEdges('execute', (state) => {
  if (state.iterationCount < 3 && hasPendingIssues(state)) {
    return 'collect_data';   // 继续循环
  }
  return END;                // 结束
});

workflow.setEntryPoint('collect_data');
workflow.addEdge('collect_data', 'analyze');
workflow.addEdge('analyze', 'execute');

export const thermostatApp = workflow.compile();
```

### 10.4 AI 决策流程全景

```
                   ┌────────────────────────────────────┐
                   │  MQTT 传感器数据到达（云端 Broker）   │
                   │  NestJS MqttService 接收            │
                   │  ↓ 来自本地 Broker 的桥接数据        │
                   └────────────────┬───────────────────┘
                                    ▼
                   ┌────────────────────────────────────┐
                   │  LangGraph 工作流触发                │
                   └────────────────┬───────────────────┘
                                    ▼
          ┌─────────────────────────────────────────────────┐
          │  节点 1: collect_data                            │
          │  get_all_room_env() → 全屋环境快照                │
          └────────────────┬────────────────────────────────┘
                           ▼
          ┌─────────────────────────────────────────────────┐
          │  节点 2: analyze                                 │
          │  LLM 评估：哪些房间需要调节？                      │
          │  ├ 室温 > 30°C → 开启制冷                        │
          │  ├ 室温 28~30°C → 调至 26°C                      │
          │  ├ 室温 < 22°C → 关闭或制热                      │
          │  └ 多房间 → 按优先级排序                          │
          └────────────────┬────────────────────────────────┘
                           ▼
          ┌─────────────────────────────────────────────────┐
          │  节点 3: execute                                 │
          │  control_aircon(roomId, temp, mode)              │
          │  ↓ NestJS MqttService.sendCommand()              │
          │  ↓ 云端 Broker → Bridge → 本地 Broker             │
          │  ↓ ESP32 红外发射 → 空调响应                      │
          └────────────────┬────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ 仍有异常？   │──否──▶ END
                    │  ≤ 3 轮     │
                    └──────┬──────┘
                           │ 是
                           ▼
                  回到 collect_data（下一轮评估）
```

### 10.5 AI Prompt 核心策略

```typescript
const SYSTEM_PROMPT = `你是一个智能家居温控管家。你的职责：

## 核心原则
1. **舒适优先**：维持室温在 22°C ~ 26°C 的舒适区间
2. **节能辅助**：在舒适前提下尽量减少能耗
3. **主动调节**：发现异常主动控制，不等用户反馈
4. **断网感知**：关注数据中的 broker 字段，
   如果设备只连了本地 broker，说明互联网异常，
   减少非必要指令下发

## 决策规则
| 室温区间 | 动作 |
|----------|------|
| > 30°C   | 立即开启制冷，目标 26°C |
| 28~30°C  | 若空调关闭则开启制冷至 26°C |
| 22~26°C  | 舒适区间，保持当前状态 |
| 18~22°C  | 若空调制冷中则调高或关闭 |
| < 18°C   | 开启制热，目标 22°C |

## 输出格式
返回 JSON 数组，每个决策包含：
- roomId: 房间 ID
- action: 动作描述
- command: 控制指令参数
- reason: 决策理由（中文，用于前端展示）
`;
```

---

## 11. 数据流与业务流程

### 11.1 完整数据链路

```
┌──────────┐  TCP/MQTT  ┌──────────────┐  WS/MQTT   ┌──────────────────────┐
│  ESP32    │──────────▶│  🏠 本地      │──────────▶│  React 前端 3D 场景   │
│  DHT22    │  上报数据  │  EMQX Broker  │  实时数据  │  温度颜色/动画变化    │
│  (本地)   │           │  (家庭服务器)  │           │  + 连接状态指示       │
└──────────┘           └──────┬───────┘           └──────────────────────┘
                              │ Bridge (TLS)
                              │ 双向 house/room/#
                     ┌───────▼────────┐
                     │  ☁️ 云端 EMQX   │
                     │  EMQX Cloud    │
                     └───────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  NestJS 后端     │
                    │  (云端 Kubernetes)│
                    │  MqttService     │
                    │  RoomService     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     ┌──────────────┐ ┌────────────┐ ┌──────────────┐
     │ InfluxDB      │ │ LangChain  │ │ 前端 WebSocket│
     │ 时序历史数据  │ │ AI Agent   │ │ 实时状态广播  │
     └──────────────┘ └──────┬─────┘ └──────────────┘
                             │ MQTT 下发
                             ▼
                    ┌──────────────────┐
                    │ 云端 Broker →    │
                    │ Bridge → 本地    │
                    │ Broker → ESP32   │
                    │ 38KHz 红外 → 空调│
                    └──────────────────┘
```

### 11.2 业务模块划分

#### 模块 1：数据采集 & 持久化
1. ESP32+DHT22 每 30s 采集温湿度
2. TCP-MQTT 同时发布到**本地 Broker** 和**云端 Broker**
3. 本地 Redis 缓存最近 1h 数据（前端直接读）
4. 云端 InfluxDB 长期存储（历史趋势查询）
5. 工作流：`ESP32 → MQTT → 本地(缓存) + 云端(持久化)`

#### 模块 2：3D 可视化渲染
1. React 启动 Three.js 场景（@react-three/fiber Canvas）
2. mqtt.js 通过 **WS-MQTT 连接本地 Broker**，毫秒级更新
3. 本地 Broker 断连 → 自动切换 **WSS 连接云端 Broker**
4. 前端右上角显示当前连接的 Broker 状态（🏠 本地 / ☁️ 云端 / ❌ 离线）
5. 3D 场景中每个房间显示连接的 Broker 小标记

#### 模块 3：设备控制
1. 用户点击 3D 场景中的设备 → 弹出控制面板
2. **本地场景**：控制指令 → 本地 Broker → ESP32（<10ms）
3. **远程场景**：控制指令 → NestJS API → 云端 Broker → Bridge → 本地 Broker → ESP32（<300ms）
4. 指令含 `viaBroker` 字段，标明来源路径

#### 模块 4：AI 智能决策
1. NestJS MqttService 收到数据 → 触发 LangGraph 工作流
2. 工作流跑在云端，通过云端 Broker 下发控制指令
3. AI 决策结果 → WebSocket 推送到前端展示
4. 决策日志写入 PostgreSQL（可追溯、可审计）

#### 模块 5：断网容灾与恢复
1. 互联网断连 → 本地 Broker 继续服务，AI 降级为本地阈值
2. 完全断网 → ESP32 本地阈值自控
3. 网络恢复 → 云端 Broker 重连 → Bridge 同步离线数据 → AI 重新接管
4. 用户收到通知："系统已恢复在线模式"

### 11.3 网络状态切换逻辑（前端）

```
                    ┌───────────────────┐
                    │ 页面加载           │
                    └────────┬──────────┘
                             ▼
                    ┌───────────────────┐
                    │ 尝试连接本地 Broker │
                    │ ws://:8083        │
                    └────────┬──────────┘
                             │
                    ┌────────▼─────────┐
                    │ 连接成功？         │
                    └───┬──────────┬───┘
                      是│          │否
                        ▼          ▼
              ┌─────────────┐  ┌─────────────────┐
              │ 🟢 本地模式  │  │ 尝试连接云端 Broker│
              │ 延迟 <10ms   │  │ wss://:8084     │
              │ AI: 云端决策  │  └────────┬────────┘
              └─────────────┘           │
                                ┌───────▼────────┐
                                │ 连接成功？       │
                                └───┬────────┬───┘
                                  是│        │否
                                    ▼        ▼
                            ┌──────────┐ ┌──────────┐
                            │ 🟡 远程   │ │ 🔴 离线   │
                            │ 远程控制  │ │ 仅本地缓存│
                            │ AI 可用   │ │ 无 AI    │
                            └──────────┘ └──────────┘
```

---

## 12. 实施步骤

### 📦 第一阶段：基础设施搭建

- [ ] 选择本地宿主机（树莓派 4B+/NAS/旧电脑）
- [ ] 部署 Docker + docker-compose
- [ ] `docker-compose up` 启动本地 EMQX + Redis + InfluxDB
- [ ] 云端注册 EMQX Cloud / 阿里云 MQTT 实例
- [ ] 配置本地 → 云端 MQTT Bridge（双向同步）
- [ ] 初始化 pnpm monorepo 工作区
- [ ] 共享类型包 `apps/shared` 定义所有 TypeScript 接口

### 🔧 第二阶段：硬件搭建与通信

- [ ] ESP32 固件开发（PlatformIO）
- [ ] WiFi 连接管理 + 双 Broker 同时连接逻辑
- [ ] DHT22 驱动程序实现（每 30s 采集）
- [ ] VS1838 红外学习功能开发
- [ ] 38KHz 红外发射控制空调
- [ ] MQTT 通信联调（MQTTX 工具验证本地 + 云端）

### 🏗 第三阶段：NestJS 后端开发

- [ ] `nest new` 初始化项目，配置模块结构
- [ ] MQTT 微服务模块开发（连接云端 Broker）
- [ ] Room 模块开发（CRUD + 历史数据 API）
- [ ] WebSocket Gateway（向前端推送实时数据）
- [ ] InfluxDB 时序数据存储适配
- [ ] Prisma + PostgreSQL 关系数据模型

### 🎨 第四阶段：React 前端 + 3D 可视化

- [ ] Vite + React 19 初始化项目
- [ ] React Three Fiber 场景搭建
- [ ] Blender 建模 → GLB 导出 → 场景加载
- [ ] mqtt.js 双 Broker 自动切换连接逻辑
- [ ] 温度颜色映射 + Zustand 状态管理
- [ ] Antd 控制面板 + 实时曲线
- [ ] Broker 连接状态指示组件

### 🤖 第五阶段：LangChain AI Agent

- [ ] StructuredTool 定义（env / ac 工具）
- [ ] Agent Prompt 设计（含断网感知规则）
- [ ] LangGraph 温控工作流编译
- [ ] AI 决策 → MQTT 指令下发链路打通
- [ ] AI 决策日志与前端展示

### 🔗 第六阶段：系统联调

- [ ] ESP32 → 本地 Broker → 前端全链路数据验证（本地场景）
- [ ] ESP32 → 本地 Broker → Bridge → 云端 → AI → 下发全链路（远程场景）
- [ ] 断网/断连容灾测试（拔网线验证本地控制是否正常）
- [ ] 网络恢复后数据同步验证
- [ ] 性能优化（3D 场景 LOD、MQTT QoS 策略）

---

## 13. 软硬件清单

### 硬件清单

| 序号 | 硬件 | 数量 | 用途 |
|:---:|------|:---:|------|
| 1 | ESP32-WROOM-32（Type-C） | 每房间 1 个 | 主控芯片 |
| 2 | DHT22 温湿度传感器 | 每房间 1 个 | 温湿度采集 |
| 3 | VS1838 红外接收头 | 每房间 1 个 | 学习空调遥控码 |
| 4 | 红外发射模块（38KHz） | 每房间 1 个 | 控制空调 |
| 5 | 面包板 + 杜邦线 + 5V 电源 | 每房间 1 套 | 电路搭建 |
| 6 | 本地服务器（树莓派 4B / NAS） | 1 台 | 运行本地 EMQX + DB |

### 软件与工具

| 分类 | 工具/依赖 | 用途 |
|------|----------|------|
| **MQTT 本地** | EMQX 开源版 | 本地消息代理 |
| **MQTT 云端** | EMQX Cloud / 自建 | 云消息代理 |
| | MQTTX | MQTT 通信调试工具 |
| **后端** | Node.js 22 + pnpm | 运行时与包管理 |
| | NestJS + TypeScript | 后端框架 |
| | Prisma | ORM 数据模型 |
| | InfluxDB | 时序数据存储 |
| | PostgreSQL | 关系数据存储 |
| | Redis | 本地缓存 |
| **前端** | React 19 + TypeScript + Vite | 前端框架 |
| | @react-three/fiber + drei | React 3D 渲染 |
| | zustand | 状态管理 |
| | mqtt.js | 浏览器 MQTT 客户端 |
| **AI** | LangChain.js (Node.js) | AI Agent 框架 |
| | @langchain/langgraph | Agent 工作流 |
| | OpenAI API / 兼容 API | LLM 模型 |
| **硬件** | PlatformIO (VS Code) | ESP32 嵌入式开发 |
| **建模** | Blender | 3D 模型制作 |
| **部署** | Docker Compose | 本地容器编排 |
| | Kubernetes / Docker | 云端部署 |

---

## 14. 总结与展望

本方案实现了 **物联网数据采集 → MQTT 双 Broker 通信 → React 3D 可视化展示 → LangChain AI 智能决策** 的完整闭环。

### 核心优势

| 维度 | 优势 |
|------|------|
| 🏠 **本地优先** | 双 Broker 架构，断网不断控，本地响应 <10ms |
| ☁️ **远程可达** | 云端 Broker 固定域名，外网随时随地访问 |
| 🎯 **全栈 TypeScript** | 前后端共享类型、编译期类型安全、降低沟通成本 |
| 🧠 **AI 驱动** | LangGraph 工作流编排，多轮评估、自愈闭环 |
| 🎨 **3D 可视化** | React Three Fiber 声明式 3D 开发，与 React 生态无缝集成 |
| 🔧 **可维护性** | NestJS 模块化架构、Monorepo 统一管理 |
| 🛡 **容灾设计** | 四级降级策略：云端 AI → 本地 AI → 本地阈值 → ESP32 硬件自控 |

### 可扩展方向

- **多传感器融合**：接入 PM2.5、CO₂、光照、人体红外传感器
- **语音助手**：通过 NestJS 集成小爱/天猫精灵技能
- **多模态交互**：语音 + 3D 视觉 + 文字提示三重反馈
- **场景联动**：温控 + 窗帘 + 灯光 + 地暖联动（IFTTT 规则引擎）
- **边缘计算**：在 ESP32-S3 上部署微型 TFLite 模型，断网不休眠
- **App 端**：React Native 跨平台移动端，复用 3D 场景代码
- **多级告警**：温度异常 → 钉钉/飞书/微信推送 → 电话告警

---

> **文档版本**：v2.1  
> **技术栈**：React 19 + R3F / NestJS / LangChain.js / EMQX 双 Broker / ESP32  
> **日期**：2026-07-17
