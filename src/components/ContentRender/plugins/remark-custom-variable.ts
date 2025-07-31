import { visit } from 'unist-util-visit'
import type { Node, Parent, Literal } from 'unist'

interface CustomVariableNode extends Node {
  data: {
    hName: string
    hProperties: {
      variableName?: string
      buttonTexts?: string[]
      placeholder?: string
    }
  }
}

// 定义格式类型枚举
enum FormatType {
  BUTTONS_WITH_PLACEHOLDER = 0,  // 按钮+占位符
  BUTTONS_ONLY = 1,              // 只有按钮
  SINGLE_BUTTON = 2,             // 单个按钮
  PLACEHOLDER_ONLY = 3           // 只有占位符
}

// 定义匹配规则接口
interface MatchRule {
  regex: RegExp
  type: FormatType
}

// 定义分隔符（支持英文|和中文｜）
const SEPARATOR = '[|｜]'  // 匹配英文|或中文｜
const SEPARATOR_GLOBAL = new RegExp(SEPARATOR, 'g')

// 配置化的匹配规则（调整顺序和逻辑，使用统一的分隔符）
const MATCH_RULES: MatchRule[] = [
  {
    // 格式1: ?[%{{variable}} button1 | button2 | ... placeholder] (按钮+占位符，优先级最高)
    regex: new RegExp(`\\?\\[\\%\\{\\{\\s*(\\w+)\\s*\\}\\}\\s*([^\\]\\|｜]+(?:\\s*${SEPARATOR}\\s*[^\\]\\|｜]+)*)\\s*${SEPARATOR}\\s*\\.\\.\\.\\s*([^\\]]+)\\]`),
    type: FormatType.BUTTONS_WITH_PLACEHOLDER
  },
  {
    // 格式4: ?[%{{variable}} ... placeholder] (只有占位符，提高优先级)
    regex: /\?\[\%\{\{\s*(\w+)\s*\}\}\s*\.\.\.\s*([^\]]+)\]/,
    type: FormatType.PLACEHOLDER_ONLY
  },
  {
    // 格式2: ?[%{{variable}} button1 | button2]
    regex: new RegExp(`\\?\\[\\%\\{\\{\\s*(\\w+)\\s*\\}\\}\\s*([^\\]\\|｜]+(?:\\s*${SEPARATOR}\\s*[^\\]\\|｜]+)+)\\s*\\]`),
    type: FormatType.BUTTONS_ONLY
  },
  {
    // 格式3: ?[%{{variable}} button]
    regex: /\?\[\%\{\{\s*(\w+)\s*\}\}\s*([^\|\]｜]+)\s*\]/,
    type: FormatType.SINGLE_BUTTON
  }
]

// 解析结果接口
interface ParsedResult {
  variableName: string
  buttonTexts: string[]
  placeholder?: string
}

/**
 * 解析不同格式的内容
 */
function parseContentByType(match: RegExpExecArray, formatType: FormatType): ParsedResult {
  const variableName = match[1].trim()
  
  switch (formatType) {
    case FormatType.BUTTONS_WITH_PLACEHOLDER:
      // ?[%{{variable}} button1 | button2 | ... placeholder]
      return {
        variableName,
        buttonTexts: match[2].split(SEPARATOR_GLOBAL).map(text => text.trim()).filter(text => text.length > 0),
        placeholder: match[3].trim()
      }

    case FormatType.BUTTONS_ONLY:
      // ?[%{{variable}} button1 | button2]
      return {
        variableName,
        buttonTexts: match[2].split(SEPARATOR_GLOBAL).map(text => text.trim()).filter(text => text.length > 0),
        placeholder: undefined
      }

    case FormatType.SINGLE_BUTTON:
      // ?[%{{variable}} button]
      const buttonText = match[2].trim()
      return {
        variableName,
        buttonTexts: buttonText ? [buttonText] : [],
        placeholder: undefined
      }

    case FormatType.PLACEHOLDER_ONLY:
      // ?[%{{variable}} ... placeholder]
      return {
        variableName,
        buttonTexts: [],
        placeholder: match[2].trim()
      }

    default:
      throw new Error(`Unsupported format type: ${formatType}`)
  }
}

/**
 * 查找第一个匹配的规则
 */
function findFirstMatch(value: string): { match: RegExpExecArray; rule: MatchRule } | null {
  for (const rule of MATCH_RULES) {
    rule.regex.lastIndex = 0
    const match = rule.regex.exec(value)
    if (match) {
      return { match, rule }
    }
  }
  return null
}

/**
 * 创建AST节点片段
 */
function createSegments(
  value: string, 
  startIndex: number, 
  endIndex: number, 
  parsedResult: ParsedResult
): Array<Literal | CustomVariableNode> {
  return [
    {
      type: 'text',
      value: value.substring(0, startIndex)
    } as Literal,
    {
      type: 'element',
      data: {
        hName: 'custom-variable',
        hProperties: parsedResult
      }
    } as CustomVariableNode,
    {
      type: 'text',
      value: value.substring(endIndex)
    } as Literal
  ]
}

export default function remarkCustomButtonInputVariable() {
  return (tree: Node) => {
    visit(
      tree,
      'text',
      (node: Literal, index: number | null, parent: Parent | null) => {
        // 输入验证
        if (index === null || parent === null) return
        
        const value = node.value as string
        const matchResult = findFirstMatch(value)
        
        if (!matchResult) return

        const { match, rule } = matchResult
        const startIndex = match.index
        const endIndex = startIndex + match[0].length

        try {
          // 解析匹配结果
          const parsedResult = parseContentByType(match, rule.type)
          
          // 创建新的节点片段
          const segments = createSegments(value, startIndex, endIndex, parsedResult)
          
          // 替换原节点
          parent.children.splice(index, 1, ...segments)
          
        } catch (error) {
          console.warn('Failed to parse custom variable syntax:', error)
          // 如果解析失败，保持原样不处理
          return
        }
      }
    )
  }
}
