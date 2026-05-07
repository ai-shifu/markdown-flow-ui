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
- 若后端 `sequence_number` 在同一 `element_bid` 的流式分片中持续递增导致 iframe 重挂载白闪，可在前端引入“渲染序号映射层”（按 `element_bid` 稳定映射，仅用于渲染键稳定），同时保持业务字段 `is_new` 原样透传。
- 当单个 iframe 幻灯片需要撑满宿主容器时，不要只检查 HTML 根节点的 `h-screen`/视口高度；还要沿首个有效内容节点的单子节点主链继续向下检查，因为常见结构会把真正的满屏类名放在根节点下一层包装容器上。若运行时高度回退值固定为 `480px`，优先排查这里是否漏检，避免测量结果被默认高度反向锁死。
- 当 sandbox HTML 先输出一个占位根节点、再通过 `<script>` 把真正的 `min-h-screen` / `h-dvh` 内容注入进去时，运行时高度探测仍要沿该占位根节点继续向下追到首个单子节点主链；不要因为静态 HTML 根节点没有满屏类名，就把 iframe 永久锁在默认回退高度。
- `buffering` 浮层与底部 player 显隐应解耦：音频加载提示出现时，只显示 loading 浮层，不要因为 `isAudioLoadingVisible` 之类的状态强行唤起或保持 player 可见。
- 当当前步骤音频 `audio_url` 一旦返回时，应立即视为“当前步骤音频已就绪”并关闭 `buffering` 浮层；若下一步 marker 是 `interaction`，遵循普通流程：等待用户可播放并在当前音频真实结束后再前进并拉起浮层，不做自动延迟跳转。
- 当同一个 speakable element 同时存在非 final `audio_segments` 与已完成的 `audio_url` 时，`audio_url` 不能在 `useSlide` 的音频归一化里被清空；它代表该步骤已有完整音频，`isAudioStreaming` 应视为 false，避免 segment 播完后继续等待下一段并把 loading 打回 true。
- 当需要借助 loading 文案定位听课模式卡住原因时，优先让 `Slide bufferingText` 支持按原因配置至少三类文案：当前步骤尚未收到音频、当前音频资源正在加载、当前流式音频正在等待后续片段；不要只保留单一的 `Buffering...`。
- 当历史回退/前进落到已提交的 `interaction` step（例如已有 `user_input` 或 `readonly`）时，仍应自动打开只读态 interaction 浮层，再复用既有自动继续逻辑；不要只让 player 的 interaction 按钮进入可点击状态而不展示浮层。
- 当历史 `interaction` 已带有真实 `user_input` 时，浮层回填应优先使用这份已提交值，不要再被 `interactionDefaultValueOptions.resolveDefaultValues` 一类外部默认值覆盖；若交互控件组件内部持有本地 state，还要在默认值变更时同步重置。
- 当历史 `interaction` 使用 `?[%{{var}} a || b || ...其他]` 这类简写语法，且 `user_input` 是逗号拼接后的已提交结果时，默认值解析必须先把已知选项映射回 `selectedValues`，只把未命中的残余文本回填到自定义输入框；不要因为简写解析失败把整串 `user_input` 原样塞进输入框。
- 当历史 `interaction` step 与 `subtitle_cues` 需要同屏展示时，不要再用“字幕出现立即关闭浮层”的方式避免遮挡；优先保留交互浮层，并让它以短延时打开，同时把字幕层提到更高层级，并按当前交互浮层实际高度把字幕上移到浮层上方。
- 当交互浮层视觉要求改为纯卡片样式时，PC 与移动端都要同时移除底部箭头的 DOM 结构、定位覆盖和偏移变量，不要只删单侧样式导致另一端残留错位逻辑。
- 当历史音频只是完成 `loadedmetadata` / `canplay` 初始化、但用户还没真正触发播放时，不要因为播放时钟被同步到 `0ms` 就提前展示 `subtitle_cues`；字幕应等到音频真实触发 `play` 事件后再显示。
- 当 `Slide` 需要暴露字幕开关时，优先把开关状态提升到 `Slide` 统一管理；PC 端把 `Captions / CaptionsOff` 按钮放在左侧主控制区的第一个可见 icon 位置，移动端不要直接塞进底栏网格，而是放进 `More` 打开的 settings sheet 中，并排在 `Screen` 设置上方。
- 当 `Slide` 底部 player 因自动隐藏而不可见，但当前音频字幕仍在展示时，字幕浮层应下移到 player 原本所在的底部区域，而不是继续悬在 player 上方保留空白。
- 当字幕只依赖音频播放时钟推进时，不要把 `currentPlaybackTimeMs` 这类时间值提升到 `Slide` 或 `Player` 的 React state 中逐帧 `setState`；应改用独立的 playback time store / subscription，让 `SubtitleOverlay` 这类小组件自行订阅时间，避免整页和 player 在播放期间持续重渲染。
- 当 `Slide` 字幕浮层在浅背景内容上对比度不足时，优先把字幕容器调整为中性深灰底配白字，并复用 `--foreground / --background / --primary-foreground` 这类现有变量做 `color-mix`，避免直接写死新的色值体系。
- 当 `Slide` 当前 step 没有可播音频、也不是交互 step、且后面仍有内容要自动推进时，底部中间按钮应切换为“自动播放开关”语义：开启时显示暂停态并允许静默 step 自动前进，关闭时显示播放态并暂停静默 step 的自动推进；但对“可讲解 yet 音频尚未到达”的 buffering 场景，仍要坚持以真实音频播放状态为准，不要提前切到暂停态。若用户在静默 step 手动关掉了自动播放，只要通过前进/后退切到新的 step，中间按钮初始化都要重置回默认暂停态。
- 当 `Slide` player 已具备全屏切换能力但按钮被隐藏时，优先恢复现有按钮与回调链路，不要重复发明第二套全屏实现；同时让播放器根据 `fullscreenchange` 同步图标状态，进入全屏显示“退出全屏”图标，退出后恢复“进入全屏”图标，并同步检查移动端控制数量或浮层箭头偏移是否需要跟随新增按钮调整。
- 当只需调整桌面端 `Slide` 底部 player 的垂直定位时，优先改 `Slide.tsx` 中 player 容器的桌面定位 class，并保持 `.slide--mobile-device .slide-player` 的 `bottom` override 不变，避免移动端底栏跟着偏移。
- 当桌面端 `Slide` 底部 player 的垂直定位发生变化时，要同步检查字幕浮层与 interaction 浮层里用于计算相对位置的 `--slide-player-bottom-offset`，确保它们和 player 一起位移，但彼此间距保持不变；移动端继续保留各自的 `0px` override。
- 当桌面端 `Slide` 进入浏览器全屏后需要单独调整底部 player 的 `bottom`（例如改为 `12px`）时，优先在 `Slide.tsx` 根节点补充语义类（如 `slide--browser-fullscreen`），再让字幕浮层与 interaction 浮层在该类下同步覆写 `--slide-player-bottom-offset`，避免只移动 player 导致间距失衡。
- 当 `Slide` 字幕浮层需要限制最大宽度时，优先使用 `left/right` 边距来定义可用区域，而不是用 `width: calc(...)` 直接计算宽度；外层容器负责撑满可用宽度，内层字幕卡片继续用 `margin: 0 auto` 保持默认居中。
- 当移动端 fullscreen 下的 `interaction` 浮层内容比默认卡片更高时，不要把可视区域硬锁在 `240px` 并在卡片内部制造滚动条；优先放宽 overlay 与 interaction body 的高度约束，让浮层先占用可用视口高度，再决定是否需要额外滚动策略。
- 当移动端 fullscreen 下需要放大 `interaction` 浮层时，不要用覆盖整块内容区的透明 overlay 去换高度，否则会吞掉“点击内容区唤起 header/player”的事件；优先让 overlay 透明区域 `pointer-events: none`，只让实际卡片恢复 `pointer-events: auto`。
- 当移动端 fullscreen 下字幕与底部 player 出现重叠时，优先校正字幕定位里使用的 `--slide-player-height` 到真实的 fullscreen player 高度，而不是只靠拍脑袋追加临时位移；这样字幕能稳定停在 player 上方并保持既有间距。
- 当移动端 fullscreen 下字幕需要与内容区边界严格对齐时，字幕外层的 `left/right` 应复用 fullscreen 内容区的横向 padding（例如 `24px`），不要继续沿用普通移动端的 `12px` 边距，否则字幕会超出内容可视区域。
- 当 `Slide` 的 `interaction` 浮层需要按内容自然撑高时，不要同时保留 `interaction card` 或 `interaction body` 上的 `max-height` / `overflow-y: auto` 限制；应移除这些高度上限，让浮层自身决定高度。
- 当阅读模式要求 `ContentRender` 与追问块同屏首现时，不要把包含 markdown 与 sandbox 的整段内容放进同一个 `Suspense fallback`，避免正文被统一回退成 loading 占位。
- 当动态加载导致正文明显晚于追问块出现时，可恢复 `IframeSandbox` 的静态引入，并保留进入 sandbox 前的标签短路判断，避免无 sandbox 内容仍触发重分段。
- 当 sandbox vendor 体积较大时，可同时保留浏览器端预热与按需注入：预热负责缩短首个 iframe 启动耗时，按需注入负责避免无 sandbox 场景的额外渲染负担。
- 当 `ContentRender` 或 iframe sandbox 在一次预加载/首屏优化 PR 后出现“加载更慢、渲染更晚”的体感回退时，排查顺序应优先放在 `IframeSandbox` / `SandboxApp`，先看模块级 vendor 预热是否让无 sandbox 场景也提前拉大 chunk，再看图片 `preload` / `decode` / `fetchpriority` 是否把 DOM 提交延后，其次检查“保留上一帧直到图片就绪”的 overlay 策略，以及是否对同一份 HTML 反复做 `template.innerHTML` 高度探测；最后再回看 `ContentRender` 自身是否引入了重复的内容解析。
- 当目标是快速回退上述首屏回归时，优先做最小变更：移除 `IframeSandbox` 的模块级 vendor 预热，移除 iframe 内图片预加载与 ready 阻塞链路，再移除 `SandboxApp` 中“保留上一帧直到图片 ready”的 overlay 逻辑；其余高度测量与内容解析逻辑保持不动，便于 A/B 对比定位。
- 当完成上述回退后仍觉得 iframe 首现偏慢，可继续收敛高度探测成本：对同一份 sandbox HTML 只做一次高度元信息解析，并把结果随当前渲染状态缓存复用；`updateHeight` 应优先读取这份预计算的视口高度，只有拿不到时才回退到运行时 DOM 主链探测。
- 当继续清理 `ContentRender` 首屏链路时，优先删除“恒为 false / 只写不读”的准备态分支与状态，例如隐藏的 html fallback、不会展示的 sandbox loading、只 `set(true)` 却从不参与渲染的 ready 状态；同时避免在 `ContentRender` 已完成 sandbox 分段后，又在 `IframeSandbox` 内对同一内容再次 `splitContentSegments`。

## 验证

- 验证前进和后退导航仍落在正确的可视步骤。
- 验证隐藏的 iframe 步骤保持挂载，重新显示时无新的加载闪烁。
- 运行最近的幻灯片 `story` 或 `demo`，覆盖 `html`、`diff`、`interaction` 元素。
- 运行最近 `package.json` 要求的 lint 与格式化检查。
