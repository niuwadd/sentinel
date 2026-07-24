# GSAP Animation

当以下情况发生时，加载 `gsap-core` + `gsap-react` + `gsap-timeline` 技能：

- 编辑或创建涉及 GSAP 动画的文件
- 用户要求添加动画效果、过渡、缓动
- 操作 `useRef`、`useGSAP`、`gsap.context()` 相关代码
- 涉及 `client/src/components/` 中任何用了 GSAP 的组件（如 RoomStrip、FadeContent）
- 需要编排多步骤动画序列

不加载 `gsap-scrolltrigger` 和 `gsap-plugins`，项目不涉及滚动动画和高级插件。
