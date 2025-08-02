const unescapeMarkdown = (markdownText: string): string => {
  // 转义字符映射表
  const escapeMap: Record<string, string> = {
    '\\\\': '\\', // 反斜杠
    '\\n': '\n', // 换行符
    '\\r': '\r', // 回车符
    '\\t': '\t', // 制表符
    '\\"': '"', // 双引号
    "\\'": "'", // 单引号
    '\\b': '\b', // 退格符
    '\\f': '\f' // 换页符
  }

  // 处理转义序列的正则表达式
  const escapeRegex = /\\[\\nrt"'bf]|\\u([0-9a-fA-F]{4})/g

  return markdownText.replace(
    escapeRegex,
    (match: string, hex?: string): string => {
      // 处理 Unicode 转义序列 (\uXXXX)
      if (hex) {
        return String.fromCharCode(parseInt(hex, 16))
      }

      // 处理其他转义序列
      return escapeMap[match] || match
    }
  )
}

const processMarkdownText = (text: string): string => {
  // 1. 处理转义字符
  let processed = unescapeMarkdown(text)

  // 2. 修复常见的双重转义问题
  processed = processed.replace(/\\\\n/g, '\n').replace(/\\\\t/g, '\t')

  // 3. 规范化换行符 (Windows -> Unix)
  processed = processed.replace(/\r\n/g, '\n')

  // 4. 确保段落之间有双换行
  processed = processed.replace(/\n{3,}/g, '\n\n')

  // 5. 处理特殊空格
  processed = processed.replace(/&nbsp;|\u00A0/g, ' ')

  return processed || ''
}

export { unescapeMarkdown, processMarkdownText }
