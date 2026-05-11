---
name: content-render-typewriter-stream-story
description: 为 `markdown-flow-ui` 的 `ContentRender` 新增或更新“后端整句到达、前端按固定节奏做打字机输出”的 story 时使用本技能。
---

# ContentRender 打字机流式 story

## 核心规则

当目标是验证阅读模式里的流式文本体验时，优先把打字机能力沉淀为 `ContentRender` 的可选配置项，并保持默认关闭；story 只负责复现“源流到达”，不要让未传配置的 `ContentRender` 偏离原有即时渲染行为。

## 工作流

1. 将后端返回的原始文本片段定义为独立 fixture 常量，保持“多数情况下按句到达”的真实形态。
2. 若项目里已经有 `测试数据.json` 这类 SSE fixture，优先通过 `?raw` 导入原始文本，再按 `data:` 行解析成事件并抽取真实 `text` 元素内容，不要手写一份近似文案。
3. 在 `ContentRender` 上增加类似 `typewriter` 的可选 prop，至少包含开关和节奏参数；默认不传时应继续直接渲染 `content`。
4. 组件内部处理 append-only 文本逐步显示时，优先兼容内容持续追加的场景；若流式内容不是追加关系，应安全回退，不要让普通渲染卡住。
5. story preview wrapper 里只保留“后端分段到达”的状态，真正的逐字显示由 `ContentRender` 配置项接管。
6. 若需要强调体验差异，可在 story 中同时展示“后端已收到全文”和“当前已到达组件的流式 payload”两个面板，方便肉眼对比。
7. story 命名保持英文，名称直接体现 `typewriter` 或 `streaming` 语义。

## 约束

- 该类 story 的重点是复现节奏体验，不要顺手改动 `ContentRender` 的 markdown 解析逻辑，除非已经确认是组件级缺陷。
- 打字机批次和间隔应抽成常量，避免把 `2`、`120ms` 这类节奏值散落在 JSX 或 effect 内部。
- 若故事里需要重置回放，优先通过 `content` 依赖统一清空 story 自身的 source 状态，并让组件内部自行处理 typewriter 状态重建。
