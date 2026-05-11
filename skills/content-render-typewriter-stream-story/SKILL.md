---
name: content-render-typewriter-stream-story
description: 为 `markdown-flow-ui` 的 `ContentRender` 新增或更新“后端整句到达、前端按固定节奏做打字机输出”的 story 时使用本技能。
---

# ContentRender 打字机流式 story

## 核心规则

当目标是验证阅读模式里的流式文本体验时，优先在 `ContentRender.stories.tsx` 里新增独立 preview wrapper，通过“源流到达”和“前端匀速消费”两层节奏来复现，而不是直接修改 `ContentRender` 通用渲染逻辑。

## 工作流

1. 将后端返回的原始文本片段定义为独立 fixture 常量，保持“多数情况下按句到达”的真实形态。
2. 若项目里已经有 `测试数据.json` 这类 SSE fixture，优先通过 `?raw` 导入原始文本，再按 `data:` 行解析成事件并抽取真实 `text` 元素内容，不要手写一份近似文案。
3. 在 story preview wrapper 中拆成两段状态：
   `pendingText` 表示已到达但尚未完全展示的缓存，
   `displayText` 表示当前真正渲染给 `ContentRender` 的文本。
4. 用一个定时器模拟后端分段到达，再用另一个定时器按固定批次消费字符；中文场景优先使用 `Array.from(...)` 按字符切分，避免直接按字符串下标截断。
5. 若需要强调体验差异，可在 story 中同时展示“后端已收到全文”和“前端当前已显示文本”两个面板，方便肉眼对比。
6. story 命名保持英文，名称直接体现 `typewriter` 或 `streaming` 语义。

## 约束

- 该类 story 的重点是复现节奏体验，不要顺手改动 `ContentRender` 的 markdown 解析逻辑，除非已经确认是组件级缺陷。
- 打字机批次和间隔应抽成常量，避免把 `2`、`120ms` 这类节奏值散落在 JSX 或 effect 内部。
- 若故事里需要重置回放，优先通过 `content` 依赖统一清空 `sourceIndex / pendingText / displayText`，避免出现上一次定时器残留。
