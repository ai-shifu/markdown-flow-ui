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

// 修改正则表达式，支持空格并修正匹配逻辑
const FORMAT_REGEXES = [
  // 格式1: ?[%{{variable}} button1 | button2 | ... placeholder] (按钮+占位符)
  /\?\[\%\{\{\s*(\w+)\s*\}\}\s*([^\|\]]+(?:\s*\|\s*[^\|\]]+)*)\s*\|\s*\.\.\.\s*([^\]]+)\]/,

  // 格式2: ?[%{{variable}} button1 | button2] (只有按钮)
  /\?\[\%\{\{\s*(\w+)\s*\}\}\s*([^\|\]]+(?:\s*\|\s*[^\|\]]+)+)\s*\]/,

  // 格式3: ?[%{{variable}} button] (单个按钮)
  /\?\[\%\{\{\s*(\w+)\s*\}\}\s*([^\|\]]+)\s*\]/,

  // 格式4: ?[%{{variable}} ... placeholder] (只有占位符)
  /\?\[\%\{\{\s*(\w+)\s*\}\}\s*\.\.\.\s*([^\]]+)\]/
]

export default function remarkCustomButtonInputVariable () {
  return (tree: Node) => {
    visit(
      tree,
      'text',
      (node: Literal, index: number | null, parent: Parent | null) => {
        const value = node.value as string
        if (index === null || parent === null) return
        
        let match: RegExpExecArray | null = null
        let formatType = -1
        
        // 按优先级顺序查找匹配
        for (let i = 0; i < FORMAT_REGEXES.length; i++) {
          const regex = FORMAT_REGEXES[i]
          regex.lastIndex = 0
          match = regex.exec(value)
          if (match) {
            formatType = i
            break
          }
        }

        if (!match || formatType === -1) return

        const startIndex = match.index
        const endIndex = startIndex + match[0].length

        type Segment = Literal | CustomVariableNode

        let variableName = ''
        let buttonTexts: string[] = []
        let placeholder: string | undefined = undefined

        // 根据匹配的格式类型解析结果
        switch (formatType) {
          case 0: // ?[%{{variable}} button1 | button2 | ... placeholder]
            variableName = match[1].trim()
            buttonTexts = match[2].split('|').map(text => text.trim()).filter(text => text.length > 0)
            placeholder = match[3].trim()
            break

          case 1: // ?[%{{variable}} button1 | button2]
            variableName = match[1].trim()
            buttonTexts = match[2].split('|').map(text => text.trim()).filter(text => text.length > 0)
            break

          case 2: // ?[%{{variable}} button]
            variableName = match[1].trim()
            const buttonText = match[2].trim()
            // 如果按钮文本不为空且不是占位符标记，则作为按钮
            if (buttonText && !buttonText.startsWith('...')) {
              buttonTexts = [buttonText]
            } else if (buttonText.startsWith('...')) {
              // 如果是占位符格式，重新匹配格式4
              const format4Regex = /\?\[\%\{\{\s*(\w+)\s*\}\}\s*\.\.\.\s*([^\]]+)\]/
              const format4Match = format4Regex.exec(value)
              if (format4Match && format4Match.index === startIndex) {
                variableName = format4Match[1].trim()
                placeholder = format4Match[2].trim()
                formatType = 3 // 重新标记为格式4
              }
            }
            break

          case 3: // ?[%{{variable}} ... placeholder]
            variableName = match[1].trim()
            placeholder = match[2].trim()
            break
        }

        const segments: Segment[] = [
          {
            type: 'text',
            value: value.substring(0, startIndex)
          } as Literal,
          {
            type: 'element',
            data: {
              hName: 'custom-variable',
              hProperties: { variableName, buttonTexts, placeholder }
            }
          } as CustomVariableNode,
          {
            type: 'text',
            value: value.substring(endIndex)
          } as Literal
        ]
        
        parent.children.splice(index, 1, ...segments)
      }
    )
  }
}