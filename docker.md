# Docker 本地环境

## 启动

```bash
docker compose up -d
```

## 停止

```bash
docker compose down
```

## 清除数据重新开始

```bash
docker compose down -v
docker compose up -d
```

## 服务清单

| 服务 | 端口 | 用途 | 访问地址 |
|------|------|------|----------|
| EMQX | 1883 | TCP-MQTT (ESP32 连接) | — |
| EMQX | 8083 | WS-MQTT (前端连接) | — |
| EMQX | 18083 | Dashboard 管理 | http://localhost:18083 |
| Redis | 6379 | 缓存 | — |
| InfluxDB | 8086 | 时序数据库 | http://localhost:8086 |

## 默认账户

| 服务 | 用户名 | 密码 |
|------|--------|------|
| EMQX Dashboard | `admin` | `public` |
| InfluxDB | `admin` | `admin1234` |

## 首次访问 InfluxDB

进入 http://localhost:8086 后：

1. 用户名 `admin`，密码 `admin1234`
2. 点击 Data → Buckets → `sensors` 即为传感器数据桶
3. 点击 Data → Tokens → 复制已有 token（或生成新 token）供后端使用

## 查看 EMQX 客户端连接

进入 http://localhost:18083：

1. 登录 admin / public
2. 左侧菜单 → Clients → Clients List
3. 设备连接后能看到 clientId、IP、连接时间
4. 左侧菜单 → WebSocket Client → 可手动测试发布/订阅
