---
name: slide-element-contract-sync
description: 为 `markdown-flow-ui` 的 `Slide` / `Element` 数据结构新增、调整或补充字段契约时使用本技能，尤其适用于需要同步公共类型导出、story 文档摘要与可选字段约束的场景。
---

# Slide 元素契约同步

## 核心规则

当 `Slide` 的 `element` 数据结构新增字段时，优先从单一类型源头补齐定义，并同步所有公共导出入口，避免业务侧只能传字段却拿不到对应类型。

## 工作流

1. 先在 `src/components/Slide/types.ts` 中新增或扩展字段类型，保持 `Element` 作为唯一契约源头。
2. 如果新增字段本身有稳定结构，优先抽成独立类型（例如 `ElementSubtitleCue`），避免在多个文件内联重复声明。
3. 将新增类型从 `src/components/Slide/Slide.tsx` 与 `src/components/Slide/index.ts` 一并对外导出，保持主入口与 slide 子入口一致。
4. 若 Storybook 中展示了 `elementList` 的类型摘要，同步补充新字段，避免文档与真实契约脱节。
5. 新字段默认按非必填处理时，显式使用可选属性，保证旧数据无需改造即可兼容。

## 约束

- 不要在多个组件文件里重复声明同一份 `Element` 子结构类型。
- 不要为纯类型扩展引入额外运行时逻辑，除非当前需求明确要求消费该字段。
- 字段命名需与上游数据保持一致；若上游使用 snake_case，类型定义也保持 snake_case。
- 当新增的是数组型子结构时，元素类型应独立命名并可复用，便于业务侧单独标注函数入参与返回值。
