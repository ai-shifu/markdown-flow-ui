---
name: slide-story-streaming
description: 为 `markdown-flow-ui` 的幻灯片（`Slide`）新增或更新可模拟流式播放的 `story` 时使用本技能，尤其适用于通过 `StreamingSlidePreview` 渲染、且为单元素 iframe 承载 `html` 的幻灯片场景。
---

# 幻灯片流式示例场景

## 核心规则

当幻灯片 `story` 需要流式行为时，保持数据最小化并复用现有 `StreamingSlidePreview`，不要重复实现定时器逻辑。

## 工作流

1. 将较长的演示 `markup` 放到独立常量，并与其他 `story` 示例数据邻近维护。
2. 当幻灯片步骤需要在 iframe sandbox 内渲染时，使用单个 `html` 元素。
3. 在流式元素上设置 `isNew: true`，让步骤表现与新到达幻灯片一致。
4. 通过 `StreamingSlidePreview` 渲染 `story`，保留现有 SSE 风格逐字符流式行为。
5. 增加简短文档描述，说明该 `story` 的流式意图。
6. 若 `story` 需要 `history + submit-to-stream`，先预载历史 fixture，聚焦最新交互标记，再在 `story` 的 `onSend` 回调中回放过滤后的 run-stream fixture。
7. 若需要验证播放器扩展性，可在 `Slide` story 中通过 `playerCustomActions` 外部传入自定义按钮节点，并使用独立 preview wrapper 承载按钮状态与点击行为。

## 约束

- 示例 `story` 名称应清晰，并保持英文命名。
- 每个 `story` 聚焦单一场景，不要混杂多种幻灯片行为。
- 复用 `createExampleElement` 等现有辅助工厂，确保元素契约一致。
- 如果内容目标是 iframe sandbox，使用 `type: "html"`，不要新增无必要元素类型。
- 当流式更新复用同一 `audio_url` 时，保留当前播放进度，仅在 URL 实际变化时重置播放。
- 当流式负载持续增加 `sequence_number` 时，不要用它作为当前音频项的重置标识；优先使用稳定元素级 key，例如 `element_bid`。
- 当 `Slide.stories.tsx` 需要把 `测试数据.json` 这类 run-stream 事件转成 `elementList` 并对齐 ai-shifu 听课模式时，应采用 `itemType + element_bid` 的稳定序号映射（含冲突顺延、失活键清理、页码重算），不要直接信任流式包里的递增 `sequence_number`。
- 当 `Slide` 播放器在流式追加 `audio_segments` 或新增后续元素时出现“当前音频被中断并重播”，应把播放状态从 index 驱动改为稳定 `audioKey` 驱动，并避免把 `index` 拼进播放器重置 key。
- 当同一元素同时带有 `audio_segments` 与 `audio_url` 时，应在渲染链路中约束为单一播放源（优先 segment 源），避免双源竞争触发重复播放或中途重置。
- 当流式 `elementList` 的内容元素在首段阶段仅出现 `text`（尚未出现非 `text` 内容）时，应在首个 `text` 之前插入 `empty-ppt` 占位页，待后续出现非 `text` 内容后再按正常内容序列渲染。
- 当同一份流式 fixture 既需要保留原始 baseline 场景，又需要复现 `empty-ppt` 占位场景时，应拆成两个独立 story，并通过 preview wrapper 的显式开关控制是否插入占位页，避免污染原 story。
- 若需要在 `markdownflow-slide--full-viewport-single-slide` 复现该行为，优先在对应 preview wrapper（如 `RunStreamSlidePreview`）里做 `elementList` 预处理，再传给 `Slide`，避免修改通用组件行为。
- 当需要复现“首次 SSE 出交互块，用户提交后第二次 SSE 触发音频卡住/循环”的问题时，应新增双阶段 story：首段回放 `测试数据2.json`，等待 `onSend` 后再回放 `测试数据.json`，并保持两段都走同一套 listen-mode 对齐的 `elementList` 组装逻辑。
- 当 run-stream 事件把 `audio_segments` / `audio_url` 附带在非 `is_speakable` 的非 `text` 元素（如 `html`）上时，应在 upsert 后将音频归属迁移到其前一个最近的 `is_speakable text` 元素，并清空该非 `text` 元素音频字段，避免语音状态错位。
- 当需要验证 `elementList.audio_segments[].audio_data` 直播能力时，优先从现有 run-stream fixture 解析并提取首个可播的 `is_speakable text` 元素，组装成单步 marker story，避免在 story 里手工维护超长 base64 常量。
- 当目标只是快速听 `audio_data` 的真实发音，不必走 `Slide` 播放链路；应基于传入 `elementList` 过滤可播放音频段并 map 渲染原生 `<audio controls>` 列表，便于逐条试听和比对。
- 播放器的“正在播放”UI 状态必须以后续 `audio` 元素真实触发 `play/canplay` 为准；在等待流式音频片段、等待补齐 `audio_url` 或等待缓冲期间，只显示 buffering，不要提前把按钮切成暂停态。
- 当单个 `html` 元素在 iframe sandbox 内以 append-only 方式持续流式增长时，不要每个 chunk 都立即重刷 iframe；应对增量更新做轻量 debounce，并在 iframe 内部 DOM 替换时短暂保留上一帧内容覆盖层，以减少 `replaceChildren` 带来的闪烁感。
- 若 slide story 的 iframe sandbox 在流式阶段主要表现为图片或圆角头像持续闪动，应优先排查运行时 Tailwind 注入；相比继续调 React key，更可能是 iframe 内 Tailwind JIT 因 class 持续变化而反复重建样式表，此时应优先复用宿主页面静态样式或注入预构建 CSS，避免在流式过程中依赖运行时 Tailwind 编译。
- 当 sandbox iframe 的内容主要依赖 Tailwind utility class 且会持续流式更新时，优先注入预构建好的静态 Tailwind CSS（例如库产物中的 `markdown-flow-ui-lib.css`），不要在该场景里继续使用运行时 Tailwind script；运行时编译更容易引发图片区域闪动、样式抖动或局部重绘。
- 若当前 sandbox 仍必须继续使用 Tailwind 浏览器脚本，则图片闪动问题应进一步收敛到 `img` 首次可渲染时机与 iframe `head` 样式稳定窗口：流式更新包含图片时，先保留上一帧覆盖层，再等待新图片可解码且 `head` 中样式不再继续变动后再揭开，避免头像在 Tailwind 运行时样式重建期间暴露出来。
- 当播放器右侧分组新增外部自定义按钮时，应同步处理 notes 相关浮层箭头偏移与移动端按钮栅格列数，避免新增按钮后交互定位或布局错位。
- 当 iframe sandbox 使用 DaisyUI 并出现“系统深色模式触发内容变暗”时，优先在 iframe 引导阶段锁定 `documentElement` 的 `data-theme="light"` 与 `color-scheme: light`，不要依赖宿主页面主题，以避免 `@media (prefers-color-scheme: dark)` 覆盖 `bg-base-*` 等语义色变量。
