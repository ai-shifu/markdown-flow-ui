---
name: slide-display-preload
description: 保持 `markdown-flow-ui` 中基于 iframe 的幻灯片（`Slide`）步骤常驻挂载，通过 CSS `display` 切换可见性。当幻灯片导航需要降低 iframe 重载耗时、要把 `is_renderable` 驱动的卸载渲染改为“隐藏但已挂载”策略、或在预加载改造中保持 `is_new`、`diff`、交互步骤语义不变时使用本技能。
---

# 幻灯片显示预加载

## 概述

保持幻灯片步骤（`Slide`）的 DOM 树持续挂载，并通过 CSS `display` 切换非激活步骤，而不是仅依赖卸载式渲染。
保留现有步骤契约，使 `is_new`、`diff`、音频时序、交互层仍按当前步骤索引运行。

## 工作流

1. 扩展 `useSlide`，输出每个 marker step 的已解析渲染列表，而不只输出当前步骤。
2. 在 `Slide.tsx` 中推导挂载步骤状态，并对相同解析状态去重，避免交互型步骤重复挂载 iframe 树。
3. 对所有需要挂载的步骤只渲染一次，再通过外层 CSS `display` 仅显示当前激活状态。
4. 让 `lastElementRef`、滚动同步、播放器逻辑只绑定当前激活状态。
5. 在“全步骤挂载”完成后移除零散的隐藏 iframe 预加载分支。

## 约束

- 渲染前先完成 `diff` 解析，不要把原始 diff 负载当独立 slide 状态直接渲染。
- 交互 marker 应保持非视觉属性，并复用上一个可视解析状态。
- 重构 `Slide` 行为时不要删除现有 `console.log` 日志。
- 优先使用外层容器可见性切换，不要在单个 iframe 上堆叠临时预加载 hack。
- 当 iframe 流式 HTML 含稳定远程图片时，重复 append-only 重渲染前先预热图片请求，并复用已有 `<img>` 节点，避免头像类资源白闪。
- 在跨流式重渲染复用 iframe `<img>` 节点时，应克隆当前可见图片到下一棵树，而不是在提交前把正在显示的 DOM 节点直接挪走。
- 当幻灯片音频可能来自远程 `audio_url` 时，提前预加载当前与下一条音频，并优先 `preload="auto"`，确保用户首次触发播放无额外网络等待。
- 若远程 `audio_url` 在首次点击播放时偶发延迟、刷新后明显变快，不要只依赖 `link rel="preload" as="audio"`；优先使用 detached `<audio preload="auto">` 预热资源，让预取与真实播放器走同一条媒体加载链路，降低跨域缓存模式不一致导致的首播抖动。
- 当 `Slide` 音频默认应自动播放时，应在首个可播放音频出现时立即真实尝试自动播放；若这次首音频自动播放被浏览器策略拒绝，则后续即使页面其他区域点击或交互让浏览器变为可播放，也仍要保持“仅 player 播放按钮可启动”的锁定状态，直到用户明确点击 player 播放按钮。
- 当两个步骤解析后可见元素列表一致时，复用同一个挂载状态。
- 在 `ai-shifu` listen 渲染链路中，`is_new` 与 `sequence_number` 默认遵循后端协议，不做前端改写；如需调整，必须先验证不会造成同屏重复渲染或流式时序回归。
- 若后端 `sequence_number` 在同一 `element_bid` 的流式分片中持续递增导致 iframe 重挂载白闪，可在前端引入“渲染序号映射层”（按 `element_bid` 稳定映射，仅用于渲染键稳定），同时保持业务字段 `is_new` 原样透传。
- 当单个 iframe 幻灯片需要撑满宿主容器时，不要只检查 HTML 根节点的 `h-screen`/视口高度；还要沿首个有效内容节点的单子节点主链继续向下检查，因为常见结构会把真正的满屏类名放在根节点下一层包装容器上。若运行时高度回退值固定为 `480px`，优先排查这里是否漏检，避免测量结果被默认高度反向锁死。
- `buffering` 浮层与底部 player 显隐应解耦：音频加载提示出现时，只显示 loading 浮层，不要因为 `isAudioLoadingVisible` 之类的状态强行唤起或保持 player 可见。
- 当当前步骤音频 `audio_url` 一旦返回时，应立即视为“当前步骤音频已就绪”并关闭 `buffering` 浮层；若下一步 marker 是 `interaction`，遵循普通流程：等待用户可播放并在当前音频真实结束后再前进并拉起浮层，不做自动延迟跳转。
- 当阅读模式要求 `ContentRender` 与追问块同屏首现时，不要把包含 markdown 与 sandbox 的整段内容放进同一个 `Suspense fallback`，避免正文被统一回退成 loading 占位。
- 当动态加载导致正文明显晚于追问块出现时，可恢复 `IframeSandbox` 的静态引入，并保留进入 sandbox 前的标签短路判断，避免无 sandbox 内容仍触发重分段。
- 当 sandbox vendor 体积较大时，可同时保留浏览器端预热与按需注入：预热负责缩短首个 iframe 启动耗时，按需注入负责避免无 sandbox 场景的额外渲染负担。

## 验证

- 验证前进和后退导航仍落在正确的可视步骤。
- 验证隐藏的 iframe 步骤保持挂载，重新显示时无新的加载闪烁。
- 运行最近的幻灯片 `story` 或 `demo`，覆盖 `html`、`diff`、`interaction` 元素。
- 运行最近 `package.json` 要求的 lint 与格式化检查。
