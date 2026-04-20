---
name: editor-media-fixed-output
description: 修改 `markdown-flow-ui` 的 `MarkdownFlowEditor` 图片或视频插入链路时使用本技能，尤其适用于插入结果需要输出为固定输出块、并且 placeholder 二次编辑仍要命中完整媒体块的场景。
---

# Editor 媒体固定输出

## 核心规则

当 `MarkdownFlowEditor` 插入图片或视频时，最终写回编辑器的内容应统一包裹为单行固定输出：`=== ... ===`。

## 工作流

1. 优先把图片和视频的输出拼接抽到共享 helper，避免 `MarkdownFlowEditor` 内分别维护两套字符串模板。
2. 生成媒体内容后，再由统一 helper 包裹固定输出标记，保证图片和视频格式一致。
3. 更新图片、视频 placeholder 的匹配规则，使其同时兼容旧格式与 `=== ... ===` 新格式。
4. `quickEdit` 中的图片、视频 placeholder 若命中固定输出块，应把前后 `===` 也一并渲染出来，而不是只显示文件名或媒体标题。
5. placeholder 点击编辑时，命中范围要覆盖整个固定输出块，而不是只覆盖内部 `<img>`、`![...]()` 或 `<iframe>`，避免二次编辑产生嵌套 `===`。
6. 同步更新 story 或示例内容，明确 editor 当前推荐的媒体输出格式。

## 约束

- 不要删除已有 `console.log` 或调试输出。
- 不要破坏旧内容的识别能力，历史未包裹 `===` 的图片和视频内容也应继续可编辑。
- 若媒体模板中已有 HTML attribute 转义逻辑，优先复用共享工具，避免图片和视频分别实现一份转义规则。
