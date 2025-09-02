import React, { useState, useEffect } from "react";
import ContentRender from "./ContentRender";

const TypewriterTest = () => {
  const [testContent, setTestContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // Simulate streaming output
  const startStreaming = () => {
    setIsStreaming(true);
    setTestContent("");
  };

  useEffect(() => {
    if (!isStreaming) return;

    const fullContent = `# 欢迎使用 Markdown Flow

这是一个测试内容，用来验证打字机效果是否正常工作。

## 基础功能测试

- 普通文本显示
- **粗体文本**测试
- *斜体文本*测试
- ~~删除线文本~~测试

### 自定义按钮测试

点击继续: ?[Continue]

或者尝试: ?[确认提交]

输入用户名: ?[%{{username}}...请输入用户名]

### 代码块测试

\`\`\`javascript
console.log('Hello World');
function test() {
  return '测试代码块';
}
\`\`\`

### 列表测试

1. 第一项
2. 第二项
   - 嵌套列表
   - 另一个嵌套项
3. 第三项

> 这是一个引用块
> 第二行引用内容

## 结束语

以上是完整的测试内容，验证打字机效果是否正常工作。`;

    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullContent.length) {
        setTestContent(fullContent.substring(0, index));
        index++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>打字机效果测试</h1>
      <button onClick={startStreaming} disabled={isStreaming}>
        {isStreaming ? "流式输出中..." : "开始测试"}
      </button>
      <div style={{ marginTop: "20px" }}>
        <ContentRender
          content={testContent}
          disableTyping={false}
          typingSpeed={30}
        />
      </div>
    </div>
  );
};

export default TypewriterTest;
