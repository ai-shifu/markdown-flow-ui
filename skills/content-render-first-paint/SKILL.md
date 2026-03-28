---
name: content-render-first-paint
description: 修复或排查 `markdown-flow-ui` 的 `ContentRender` 在关闭打字机效果时首屏空白、helper 行先于正文出现等首次渲染时序问题时使用本技能。
---

# ContentRender 首屏渲染稳定性

## 核心规则

当 `ContentRender` 关闭打字机效果时，正文应在首次 render 同步可见，不要依赖 `useEffect` 二次补内容。

## 工作流

1. 先区分问题路径是否发生在普通 markdown 渲染链路，而不是 iframe sandbox 分支。
2. 检查 `displayContent` 一类中间态是否以空字符串初始化，并在 `useEffect` 中补齐正文。
3. 若打字机已禁用，优先直接使用标准化后的完整内容参与首屏渲染，而不是等待状态机异步同步。
4. 若仍需保留状态机用于完成态回调或增量场景，确保“首屏展示内容”和“状态机内部状态”可以解耦。
5. 修复后重点验证 helper 行、追问按钮、正文块在同一批数据下是否同步可见。

## 约束

- 不要破坏启用打字机时的渐进展示行为。
- 不要删除已有 `console.log` 或调试输出。
- 优先做最小修复，避免顺手改动 markdown 解析、sandbox 或交互变量逻辑。
