---
name: slide-mobile-player-custom-action-slot
description: 当调整 `markdown-flow-ui` 的 `Slide` 移动端播放器控制栏，尤其涉及 `playerCustomActions` 的桥接型节点、占位空槽和 more icon 入口时使用本技能。
---

# Slide 移动端播放器扩展槽位

## 核心规则

移动端 `Slide` 播放器应固定保留左侧 more icon 槽位；无论是否存在 `playerCustomActions`，都要保持底部控制栏的按钮数量与视觉布局一致。

## 工作流

1. 移动端 controls 列数至少要把 more icon 这一列算进去，不要只按现有 action 数量计算。
2. more icon 只在移动端显示，桌面端继续沿用原有播放器布局。
3. 若业务层还会额外挂 `playerCustomActions`，播放器组件只负责保留入口位和栅格，不擅自改写业务层状态流。

## 约束

- 不要删除已有 `console.log` 或调试输出。
- 不要影响桌面端 `Slide` 播放器按钮顺序。
- 优先做最小改动，避免顺手改动 notes 浮层、音频播放或业务层 custom action 行为。
