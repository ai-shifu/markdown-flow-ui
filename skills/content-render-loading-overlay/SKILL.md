---
name: content-render-loading-overlay
description: 统一 `markdown-flow-ui` 中 `ContentRender`、`IframeSandbox`、`Slide` 等场景的 loading 遮罩表现时使用本技能。
---

# ContentRender Loading Overlay 一致性

## 核心规则

当 sandbox 构建样式、构建脚本、音频 buffering 等都属于“短时等待态”时，优先复用同一个小型居中 loading 卡片，不要为每个子场景各自维护一套遮罩结构与视觉样式。

## 工作流

1. 先定位当前 loading 是不是属于短时过渡态，而不是全页面错误、空态或首屏 skeleton。
2. 若多个组件都展示“spinner + 一句文案 + 居中遮罩”，优先抽取共享组件或共享样式常量。
3. 保持 loading 文案来源可配置，但卡片尺寸、圆角、模糊、阴影、图标动画等视觉规则应统一。
4. 若场景运行在 iframe 或隔离容器中，优先使用对宿主样式依赖更低的实现，避免因为 Tailwind 或主题注入时序导致 loading 闪烁或失效。
5. 修改后重点检查 `Slide bufferingText`、`Building styles...`、`Building scripts cache...` 等状态是否仍能正确切换与居中显示。
6. 若渲染链路已进入明确错误态（例如 `element.type === "error"`），应立即关闭对应 `Slide` / `IframeSandbox` / `ContentRender` 的短时 loading 遮罩，不要让 buffering、style loading、script loading 继续盖在错误态之上。

## 约束

- 不要删除已有 `console.log` 或调试输出。
- 不要把短时 loading 误改成整屏错误遮罩或 skeleton。
- 优先做样式与结构复用，避免顺手改动 sandbox 构建时序逻辑。
