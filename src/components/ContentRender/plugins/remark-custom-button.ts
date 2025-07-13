import { visit } from 'unist-util-visit';
import type { Node, Parent, Literal } from 'unist';

// 定义自定义按钮节点类型
interface CustomButtonNode extends Node {
  type: 'customButton';
  buttonText: string;
  data: {
    hName: string;
    hProperties: {
      className: string;
    };
    hChildren: Literal[];
  };
}

// 正则表达式匹配 ?[按钮文本]
const BUTTON_REGEX = /\?\[([^\]]+)\]/;

export default function remarkCustomButton() {
  return (tree: Node) => {
    visit(tree, 'text', (node: Literal, index: number | null, parent: Parent | null) => {
      const value = node.value as string;
      const match = BUTTON_REGEX.exec(value);
      
      // 如果没有匹配项或缺少父节点/索引则退出
      if (!match || index === null || parent === null) return;

      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;
      
      // 显式定义段落的联合类型
      type Segment = Literal | CustomButtonNode;
      
      // 构建替换段（显式类型声明）
      const segments: Segment[] = [
        { 
          type: 'text', 
          value: value.substring(0, startIndex) 
        } as Literal,
        {
          type: 'customButton',
          buttonText: match[1],
          data: {
            hName: 'button',
            hProperties: { className: 'custom-button' },
            hChildren: [{ type: 'text', value: match[1] } as Literal]
          }
        } as CustomButtonNode,
        { 
          type: 'text', 
          value: value.substring(endIndex) 
        } as Literal
      ].filter(seg => {
        // 针对文本节点过滤空值，按钮节点始终保留
        return seg.type === 'customButton' || (seg as Literal).value !== '';
      });

      // 替换原始节点
      parent.children.splice(index, 1, ...segments);
    });
  };
}