---
name: slide-mobile-player-custom-action-slot
description: 当调整 `markdown-flow-ui` 的 `Slide` 移动端播放器控制栏，尤其涉及 `playerCustomActions` 的桥接型节点、占位空槽和 more icon 入口时使用本技能。
---

# Slide 移动端播放器扩展槽位

## 核心规则

移动端 `Slide` 播放器应固定保留左侧 more icon 槽位；无论是否存在 `playerCustomActions`，都要保持底部控制栏的按钮数量与视觉布局一致。
当 more icon 需要承载设置能力时，优先复用播放器内部浮层，内容保持最小集合，默认只放标题和当前场景真正需要的设置项。
若设置项里出现“竖屏 / 横屏”这类方向切换，不要复用 `isFullscreen` 语义；应维护独立的移动端屏幕方向状态，并让舞台、交互浮层和播放器作为同一视口一起旋转。

## 工作流

1. 移动端 controls 列数至少要把 more icon 这一列算进去，不要只按现有 action 数量计算。
2. more icon 只在移动端显示，桌面端继续沿用原有播放器布局。
3. 若业务层还会额外挂 `playerCustomActions`，播放器组件只负责保留入口位和栅格，不擅自改写业务层状态流。
4. 若设计稿要求打开卡片式浮层，优先采用播放器附近的轻量浮层，不把它升级成全局弹窗；浮层中的设置项保持精简，避免把无关控制堆进去。
5. 若移动端 more 浮层开始承载完整设置面板或底部抽屉样式，应优先拆成独立组件，由 `Player` 只负责状态控制与事件透传，避免把结构、文案和样式继续内联在 `Player.tsx` 中。
6. 若播放器浮层存在可见文案或辅助标签，优先通过 `Slide` 对外 props 透传国际化文本，不在 `Player` 或浮层组件内部根据 `document.lang` 自行推断语言。
7. 若横屏展示采用 `transform: rotate(90deg)`，优先新增旋转视口容器，让 `Slide` 主舞台、loading、interaction overlay 和 player 同步旋转；不要只旋转单个子节点，避免宽高和定位基准错位。
8. 若移动端设置浮层与交互块浮层可能同时出现，打开或关闭设置浮层时不要擅自改写交互块浮层状态；设置面板只管理自己的开关。
9. 若设置浮层使用 `DialogPortal`，横屏模式下应把 portal 容器挂到已旋转的视口节点，而不是默认挂到 `body`，否则浮层方向会与舞台不一致。
10. 若移动端横屏模式需要补充顶部信息栏，且它应与 player 保持同一方向，就把 header 渲染到已旋转的视口里，并为内容区预留头部高度；不要挂到未旋转的外层容器上。
11. 若横屏 header 的按钮承担“返回”语义，默认应先把屏幕模式切回竖屏，再执行业务层 `onBack`；header 本身不要内置头像或标题默认结构，内容区只保留自定义渲染槽位。
12. 若移动端横屏模式需要重排 player，优先仅补充语义 class 并用 CSS 完成布局：more 固定左侧、notes 固定右侧、中间三键居中，避免改动已有播放状态机和按钮事件流。
13. 若横屏 player 使用深色渐变底，所有控制 icon 颜色应统一为白色；若播放按钮使用自绘 SVG，还需要显式覆盖其内部 `path` 的 fill，避免残留黑色底盘。
14. 若横屏底栏中间三键需要强调主操作，优先把中间按钮组间距设为 `24px`，并只给播放按钮增加白色描边，不要给左右前进/后退按钮也套上边框。
15. 若横屏模式同时展示 header 和底部 player，主内容区应预留统一安全边距，优先使用 `padding: 12px 24px`，并把 header 高度合并到顶部内边距里一起计算。
16. 若横屏模式下 header 与 player 同时存在，它们的显隐应绑定到同一套控制条可见性状态；3 秒自动隐藏时 header、player 和内容区额外 padding 一起消失，点击唤醒时再一起恢复。
17. 若横屏模式下内容区可滚动，隐藏状态时滚动本身不应唤醒 header/player；唤醒入口应使用明确的 `click/tap`，不要绑定在 `pointerdown`、`touchstart` 或滚动起手事件上。
18. 若业务层需要感知当前移动端展示模式，优先通过 `Slide` 对外暴露只读回调，例如 `onMobileViewModeChange(viewMode)`；同时导出 `MobileViewMode` 类型，避免业务层手写字符串字面量。
19. 若需要区分移动端与桌面端，不要依赖 `max-width` 或视口宽度断点；优先基于设备能力判断，例如 `pointer: coarse`、`hover: none`、`maxTouchPoints`，并把结果收敛为统一的语义状态或根 class，供 JS 逻辑与 CSS 一起复用。
20. 若移动端样式之前写在 `@media (max-width: ...)` 中，迁移时应同步改造组件逻辑和样式入口，优先改成 `.slide--mobile-device` 这类语义 class 驱动，避免横屏时误切到桌面布局。
21. 若移动端“横屏态”既可能来自设置面板手动切换，也可能来自设备真实旋转，最终样式与对外回调都应基于合并后的生效 screen mode，而不是只看手动状态，避免物理横屏时 UI 与业务层感知不一致。
22. 若设备本身已经处于物理横屏，横屏态容器不要再额外执行 `rotate(90deg)`；只有在竖屏设备里强制进入横屏展示时，才使用旋转视口去模拟横屏。
23. 若物理横屏会自动进入横屏展示，仍要保留用户显式切回竖屏的能力；优先使用“自动检测 + 手动覆盖”状态模型，不要让设备方向持续把返回按钮或竖屏设置项顶回横屏。
24. 若移动端设置浮层只应在移动语义态下展示，不要再用 `sm:hidden` 之类基于宽度断点的 class 控制显隐；横屏手机宽度变大后，这类断点会把真实移动端浮层误隐藏。
25. 若需要区分“用户手动切到横屏的沉浸式模式”和“设备物理旋转后的普通横屏模式”，应分别提供独立语义 class，例如 `slide--mobile-landscape` 与 `slide--mobile-landscape-native`；设置面板的选中项仍基于生效后的 screen mode，同步反映真实设备方向。
26. 若沉浸式横屏顶部返回按钮承担“退出沉浸式”语义，不要直接把 screen mode 强制改成竖屏；应优先清掉手动覆盖，回退到设备当前的 native 横竖屏状态，这样物理横屏设备返回后仍可保持 native landscape。
27. 若黑板模式内容通过 `IframeSandbox` 或包裹层桥接“唤醒 player”事件，移动端可滚动场景不要绑定 `pointerdown`、`mousedown`、`touchstart`；应只在 `click/tap` 这类明确激活事件上唤醒，避免真机滚动把 header/player 误显示出来。
28. 若产品要求竖屏设备里手动切到“横屏”时保持内容原地展示，不要再对 `slide__viewport` 做 `rotate(90deg)`；应只切换横屏态的 header/player/overlay 布局语义，让舞台继续沿当前视口方向渲染。
29. 若 `Slide` 对外 API 已把移动端模式语义从“横屏 / 竖屏”收敛成“fullscreen / nonFullscreen”，新增或修改 props、state、回调和文案字段时应沿用这套命名，例如 `fullscreenHeader`、`onMobileViewModeChange`、`fullscreenLabel`、`nonFullscreenLabel`；不要再混用旧的 `landscape` / `portrait` 字段名。
30. 若移动端 `Slide` 在进入 `fullscreen` 后需要追加短时引导提示，应拆成独立组件挂在 `Slide` 视口层，而不是把 overlay 结构直接内联在 `Slide.tsx` 或 `Player.tsx`；提示文案优先并入现有 `playerTexts` 这类国际化对象统一透传，默认展示后约 `2s` 自动关闭。
31. 若移动端横屏全屏态需要补一层铺满视口的最外层 mask，优先在 `Slide` 根节点内额外挂一个独立节点，并使用 `fixed + top/left: 0 + width/height: 100dvw/100dvh + max-height: 100dvh + 高 z-index` 这类样式；若产品只要求占位遮罩而非视觉蒙层，不要给它加 background，并默认加上 `pointer-events: none` 避免挡住现有交互。
32. 若进入 `fullscreen` 时设备本身已经处于横屏优先视口，不要再弹“请旋转屏幕”这类提示；这类引导只应出现在竖屏进入全屏、仍需要用户主动旋转设备的场景。

## 约束

- 不要删除已有 `console.log` 或调试输出。
- 不要影响桌面端 `Slide` 播放器按钮顺序。
- 优先做最小改动，避免顺手改动 notes 浮层、音频播放或业务层 custom action 行为。
