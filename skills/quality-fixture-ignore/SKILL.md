---
name: quality-fixture-ignore
description: 当 `markdown-flow-ui` 中新增用于复现问题的本地测试数据文件，但这些文件扩展名与真实内容格式不一致、导致 pre-commit 或 Prettier 校验失败时使用本技能。
---

# 本地测试数据忽略规则

## 核心规则

用于问题复现的本地 fixture 如果不是合法 JSON，即使文件名以 `.json` 结尾，也应从 JSON 语法检查和 Prettier 格式化中排除，避免校验工具误处理原始 SSE 或历史数据负载。

## 工作流

1. 先确认失败来自校验工具误把 fixture 当作标准 JSON 解析，而不是代码逻辑依赖了无效 JSON。
2. 优先在 `.pre-commit-config.yaml` 中排除目标 fixture，至少覆盖 `check-json` 与 `prettier` hooks。
3. 若 fixture 内容需要保持原始换行、空行或尾部格式，也同步从 `end-of-file-fixer` 与 `trailing-whitespace` 中排除。
4. 同步更新 `.prettierignore`，确保手动执行 `npm run format` 或 `npm run format:check` 时也不会处理这些 fixture。
5. 忽略规则应尽量收敛到具体 fixture 文件名，不要直接跳过所有 JSON 文件。

## 约束

- 不要为了通过校验而改写原始 fixture 内容。
- 不要删除已有 `console.log` 或调试输出。
- 若 fixture 后续改成合法 JSON，再重新评估是否需要保留忽略规则。
