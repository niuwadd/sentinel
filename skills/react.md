# React & Vercel Best Practices

当以下情况发生时，加载 `vercel-react-best-practices` + `vercel-composition-patterns`：

- 创建或重构 React 组件
- 编写自定义 Hooks（`client/src/hooks/`）
- 优化渲染性能、减少不必要的 re-render
- 数据请求模式（fetch、缓存、乐观更新）
- 涉及 zustand store 的 selector 优化
- 组件出现多个 boolean props 需要重构为复合组件

项目约束：
- 函数组件 + TypeScript，不用 class component
- 内部 import 用 `@/` 别名
- 共享类型从 `@climelens/shared` 引入
- 动画用 motion 或 GSAP，不用 CSS transition
