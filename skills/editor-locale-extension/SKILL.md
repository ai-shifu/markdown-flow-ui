---
name: editor-locale-extension
description: 修改 `markdown-flow-ui` 的 `MarkdownFlowEditor` 国际化语言时使用本技能，尤其适用于新增 locale、补充编辑器文案资源、以及让上游项目传入的语言配置安全落到编辑器内部的场景。
---

# Editor Locale 扩展

## 核心规则

当 `MarkdownFlowEditor` 新增语言支持时，要同时补齐资源文件、公开类型、运行时归一化逻辑，以及上游传入未知 locale 时的回退策略。

## 工作流

1. 先确认上游项目实际传给编辑器的 `locale` 值，优先兼容完整 locale code，例如 `en-US`、`zh-CN`、`fr-FR`。
2. 把 editor 可用语言资源集中到共享模块，避免组件内部重复维护资源表和 locale 联合类型。
3. 新增语言时同步更新 locale 归一化逻辑，让 `fr`、`fr-FR`、`fr_FR` 这类输入都能稳定落到同一个 editor locale。
4. `MarkdownFlowEditor` 的 `locale` prop 类型、`i18next` 初始化资源、slash 菜单文案和弹窗按钮文案都要走同一份资源映射。
5. 至少补一个 story 或示例，验证新增 locale 在编辑器交互里可见，而不是只更新静态资源文件。

## 约束

- 不要删除已有 `console.log` 或调试输出。
- 不要只改 TypeScript 类型而漏掉运行时映射，否则上游即使传了新 locale 也会静默回退。
- 如果新增文案 key，英文和其他已支持语言也要评估是否需要补齐，避免单语言独有 key。
