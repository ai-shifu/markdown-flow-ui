---
name: content-render-reading-mode-story
description: 为 `markdown-flow-ui` 的 `ContentRender` 新增或更新用于复现 ai-shifu 阅读模式“内容块后继续追加追问块”场景的 story 时使用本技能。
---

# ContentRender 阅读模式拼接 story

## 核心规则

当目标是复现 ai-shifu 阅读模式里的追问块追加逻辑时，不要把所有文本硬拼成一个 markdown 字符串；应显式模拟 `item` 列表按顺序渲染。

## 工作流

1. 把阅读模式里的正文块、追问块拆成独立 fixture 常量，避免把场景数据写死在 render JSX 中。
2. 使用 `story.render` 包一层预览容器，通过 `items.map(...)` 逐项渲染，直观复现“内容 item 之后继续追加 ask item”的顺序。
3. `content` 类型 item 继续走 `ContentRender`，确保 markdown、HTML、交互标签等能力与真实组件一致。
4. `ask` 类型 item 使用轻量级占位 UI 即可，重点是保留它作为独立 item 的位置和点击回调，不必在 story 中复刻完整业务弹层。
5. 若场景核心是“历史顺序优先于 anchor 位置”，就在 fixture 中把后续内容和 ask item 按真实追加顺序排好，避免在 render 阶段二次重排。
6. story 命名保持英文，名称要直接体现这是阅读模式追加追问块场景。

## 约束

- 该类 story 的重点是列表拼接顺序，不要顺手改动 `ContentRender` 通用逻辑，除非确实发现组件级缺陷。
- 追问按钮的点击行为可以只保留 `console.log` 或简单回调，方便在 Storybook 中观察 anchor 归属。
- 若需要复用多个相似阅读模式场景，优先抽出通用 item 类型和 fixture 常量，避免重复写 JSX 结构。
