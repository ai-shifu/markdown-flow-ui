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

// 调整正则顺序，优先匹配变量格式
const FORMAT_REGEXES = [
  // 格式1: ?[%{{variable}}button1|button2|...placeholder] (最复杂格式优先)
  /\?\[\%\{\{(\w+)\}\}([^\|\]]+(?:\|[^\|\]]+)*)\|\.\.\.([^\]]+)\]/,

  // 格式2: ?[%{{variable}}button1|button2]
  /\?\[\%\{\{(\w+)\}\}([^\|\]]+(?:\|[^\|\]]+)+)\]/,

  // 格式3: ?[%{{variable}}button]
  /\?\[\%\{\{(\w+)\}\}([^\|\]]+)\]/,

  // 格式4: ?[%{{variable}}...placeholder]
  /\?\[\%\{\{(\w+)\}\}\.\.\.([^\]]+)\]/
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
        let formatType = 0
        for (let i = 0; i < FORMAT_REGEXES.length; i++) {
          const regex = FORMAT_REGEXES[i]
          regex.lastIndex = 0
          match = regex.exec(value)
          if (match) {
            formatType = i
            break
          }
        }

        if (!match) return

        const startIndex = match.index
        const endIndex = startIndex + match[0].length

        type Segment = Literal | CustomVariableNode

        let variableName = ''
        let buttonTexts: string[] = []
        let placeholder: string | undefined = undefined

        // 根据匹配的格式类型解析结果
        switch (formatType) {
          case 0: // ?[{{variable}}button1|button2|...placeholder]
            variableName = match[1]
            buttonTexts = match[2].split('|')
            placeholder = match[3]
            break

          case 1: // ?[{{variable}}button1|button2]
            variableName = match[1]
            buttonTexts = match[2].split('|')
            break

          case 2: // ?[{{variable}}button]
            variableName = match[1]
            buttonTexts = [match[2]]
            break
          case 3: // ?[{{variable}}...placeholder]
            variableName = match[1]
            placeholder = match[2]
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
              value: variableName,
              hProperties: { variableName, buttonTexts, placeholder },
              hChildren: [
                {
                  type: 'text',
                  value: value.substring(startIndex + 1, endIndex)
                } as Literal
              ]
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
