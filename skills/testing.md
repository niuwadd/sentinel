# Testing

当以下情况发生时，加载 `test-driven-development` 技能：

- 编写新功能或修复 bug 前
- 编写 NestJS service 业务逻辑
- 编写 React hooks 逻辑
- 用户明确要求写测试

测试框架：
- 后端：Jest（`pnpm --filter @climelens/server test`）
- 前端 e2e：Playwright（加载 `webapp-testing` 技能）
- spec 文件命名：`*.spec.ts`（后端）、`*.test.ts`（前端）

先写测试再写实现，测试通过后再优化代码。
