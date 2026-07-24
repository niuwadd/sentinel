# Debugging

当以下情况发生时，加载 `systematic-debugging` 技能：

- 遇到运行时错误、编译错误、类型错误
- 测试失败
- 数据流异常（MQTT 消息不更新 UI、store 状态不对）
- 3D 渲染异常（R3F 场景不显示、模型位置偏移）
- 用户报告 bug

调试流程：
1. 先确认问题范围（前端/后端/MQTT/数据层）
2. 检查 `pnpm dev` 控制台是否有报错
3. 检查 Docker 服务是否正常运行（`docker compose ps`）
4. 前端问题检查浏览器 console + zustand store 状态
5. 后端问题检查 NestJS 日志 + MQTT 连接状态
