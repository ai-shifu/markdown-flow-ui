import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Slide from "./Slide";
import type { Element } from "./Slide";

const meta = {
  title: "MarkdownFlow/Slide",
  component: Slide,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    elementList: {
      description: "Slide element data list",
      table: {
        type: {
          summary:
            "{ content: ReactNode; type: string; is_show?: boolean; operation?: string; is_checkpoint?: boolean; serial_number?: number; is_read?: boolean; audio_url?: string; audio_segments?: string[]; }[]",
        },
      },
    },
    interactionTitle: {
      control: "text",
      description: "I18n-ready interaction overlay title",
    },
  },
  args: {
    elementList: [],
    interactionTitle: "Submit the content below to continue.",
  },
} satisfies Meta<typeof Slide>;

export default meta;

type Story = StoryObj<typeof meta>;

const HTML_IFRAME_CONTENT = `
<div class="w-full overflow-hidden flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
  <div class="w-full max-w-4xl bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-6">
    <h1 class="text-3xl font-bold text-[#0F63EE] text-center">哈喽美少女大战哥斯拉😉</h1>
    <p class="text-lg text-gray-800">现在麻烦你先扫码添加咱们BP刘谊的微信哦，同时需要跟你确认一下你的姓名和你使用的考勤方式。</p>
    <div class="flex justify-center w-full">
      <img src="https://resource.ai-shifu.cn/a428928668b744469e6c761d5249ecbf" alt="扫码添加微信" class="rounded-2xl w-80 h-auto shadow-md" />
    </div>
  </div>
</div>`;

const SVG_CONTENT = `<svg width="420" height="180" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="420" height="180" rx="20" fill="#f5f9ff"/>
  <circle cx="90" cy="90" r="38" fill="#0F63EE"/>
  <text x="90" y="96" text-anchor="middle" font-family="Arial" font-size="14" fill="#ffffff">Input</text>
  <rect x="180" y="55" width="90" height="70" rx="14" fill="#dbeafe" stroke="#0F63EE"/>
  <text x="225" y="96" text-anchor="middle" font-family="Arial" font-size="14" fill="#1e3a8a">Model</text>
  <rect x="320" y="55" width="70" height="70" rx="14" fill="#dcfce7" stroke="#16a34a"/>
  <text x="355" y="96" text-anchor="middle" font-family="Arial" font-size="14" fill="#166534">Output</text>
  <line x1="128" y1="90" x2="180" y2="90" stroke="#0F63EE" stroke-width="3"/>
  <line x1="270" y1="90" x2="320" y2="90" stroke="#16a34a" stroke-width="3"/>
</svg>`;

const DIFF_CONTENT = `**示例**（用户：替换 aaa 为 ddd）：
!+++
--- a/0
+++ b/0
@@ -1,3 +1,3 @@
-<h1>aaa</h1>
+<h1>ddd</h1>
 <h1>bbb</h1>
!+++`;

const IMG_CONTENT = `<img src="https://resource.ai-shifu.cn/7b007ca873b14edeb4d3e6817f520550" />`;

const INTERACTION_CONTENT = `?[%{{teaching_style}} 幽默 | 严谨 | 故事化 | ... 请输入更多偏好 ]`;

const TABLES_CONTENT = `| 阶段 | 输入 | 输出 |
| --- | --- | --- |
| 预处理 | 原始问题 | 结构化数据 |
| 推理 | 上下文 | 候选答案 |
| 生成 | 候选答案 | 最终回复 |`;

const CODE_CONTENT = `\`\`\`typescript
const renderSlide = (type: string, content: string) => ({ type, content });

console.log(renderSlide("code", "Hello Storybook"));
\`\`\``;

const LATEX_CONTENT = `$E = mc^2$\n\n$$
\\int_0^1 x^2 dx = \\frac{1}{3}
$$`;

const MARKDOWN_IMAGE_CONTENT = `![AI Shifu](https://resource.ai-shifu.cn/a428928668b744469e6c761d5249ecbf)`;

const MERMAID_CONTENT = `\`\`\`mermaid
flowchart LR
  A[Prompt] --> B[Parser]
  B --> C[Renderer]
  C --> D[Slide]
\`\`\``;

const TITLE_CONTENT = `# Slide Title\n\n## Subtitle Example`;

const TEXT_CONTENT = `This is a plain text example used to verify that normal text content can still render correctly inside Slide.`;

const LINK_CONTENT = `[OpenAI API Documentation](https://platform.openai.com/docs/overview)`;

const SLOT_CONTENT = (
  <div className="rounded-3xl border border-primary/20 bg-linear-to-br from-primary/8 to-background p-8">
    <div className="flex flex-col gap-3">
      <div className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
        Custom Slot
      </div>
      <div className="text-2xl font-semibold text-foreground">
        这是一个用户自己自定义的画面
      </div>
      <div className="text-sm text-muted-foreground">
        This area is rendered directly from a custom React node.
      </div>
    </div>
  </div>
);

const VIDEO_CONTENT = `<iframe data-tag="video" data-title="哔哩哔哩视频" data-url="https://www.bilibili.com/video/BV1ry4y1y7KZ/" class="w-full aspect-video rounded-lg border-0" src="https://player.bilibili.com/player.html?bvid=BV1ry4y1y7KZ&autoplay=0" allowfullscreen="" allow="autoplay; encrypted-media"></iframe>`;

type ExampleElementConfig = {
  serialNumber: number;
  type: Element["type"];
  content: Element["content"];
  operation?: Element["operation"];
} & Partial<Omit<Element, "serial_number" | "type" | "content" | "operation">>;

const createExampleElement = ({
  serialNumber,
  type,
  content,
  operation = "append",
  ...element
}: ExampleElementConfig): Element => ({
  content,
  type,
  is_show: true,
  operation,
  is_checkpoint: true,
  serial_number: serialNumber,
  is_read: false,
  audio_url: "",
  audio_segments: [],
  ...element,
});

const exampleElementList: Element[] = [
  createExampleElement({
    serialNumber: 1,
    type: "slot",
    content: SLOT_CONTENT,
    operation: "new",
  }),
  createExampleElement({
    serialNumber: 2,
    type: "html",
    content: HTML_IFRAME_CONTENT,
  }),
  createExampleElement({ serialNumber: 3, type: "svg", content: SVG_CONTENT }),
  createExampleElement({
    serialNumber: 4,
    type: "diff",
    content: DIFF_CONTENT,
  }),
  createExampleElement({ serialNumber: 5, type: "img", content: IMG_CONTENT }),
  createExampleElement({
    serialNumber: 6,
    type: "interaction",
    content: INTERACTION_CONTENT,
  }),
  createExampleElement({
    serialNumber: 7,
    type: "tables",
    content: TABLES_CONTENT,
  }),
  createExampleElement({
    serialNumber: 8,
    type: "code",
    content: CODE_CONTENT,
  }),
  createExampleElement({
    serialNumber: 9,
    type: "latex",
    content: LATEX_CONTENT,
  }),
  createExampleElement({
    serialNumber: 10,
    type: "md_img",
    content: MARKDOWN_IMAGE_CONTENT,
  }),
  createExampleElement({
    serialNumber: 11,
    type: "mermaid",
    content: MERMAID_CONTENT,
  }),
  createExampleElement({
    serialNumber: 12,
    type: "title",
    content: TITLE_CONTENT,
  }),
  createExampleElement({
    serialNumber: 13,
    type: "text",
    content: TEXT_CONTENT,
  }),
  createExampleElement({
    serialNumber: 14,
    type: "link",
    content: LINK_CONTENT,
  }),
  createExampleElement({
    serialNumber: 15,
    type: "video",
    content: VIDEO_CONTENT,
  }),
];

export const Default: Story = {
  args: {
    elementList: exampleElementList,
  },
};

export const FullViewportSlides: Story = {
  args: {
    elementList: exampleElementList,
  },
  render: ({ elementList = [] }) => (
    <div className="w-full">
      {elementList.map((element, index) => (
        <div
          key={`${element.serial_number ?? index}-${element.type}-viewport`}
          className="flex h-[100dvh] w-full items-center justify-center border-b border-dashed border-border bg-muted/20"
        >
          <Slide className="w-full" elementList={[element]} />
        </div>
      ))}
    </div>
  ),
};

export const FullViewportSingleSlide: Story = {
  args: {
    elementList: [
      createExampleElement({
        serialNumber: 0,
        type: "svg",
        content:
          '<svg width=\"100%\" viewBox=\"0 0 1200 675\" xmlns=\"http://www.w3.org/2000/svg\" style=\"width: 100%; height: auto; aspect-ratio: 1200 / 675;\">\n  <defs>\n    <linearGradient id=\"bg\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n      <stop offset=\"0%\" stop-color=\"#0F63EE\"/>\n      <stop offset=\"100%\" stop-color=\"#073482\"/>\n    </linearGradient>\n  </defs>\n  <rect width=\"100%\" height=\"100%\" fill=\"url(#bg)\"/>\n  <image href=\"https://resource.ai-shifu.com/ac186b833d0e417fb02737910b3a5ae0\" x=\"100\" y=\"85\" width=\"220\" height=\"505\" clip-path=\"circle(110px at 110px 130px)\"/>\n  <text x=\"420\" y=\"220\" font-size=\"65\" font-weight=\"bold\" fill=\"white\">跟 AI 学 AI 通识</text>\n  <text x=\"420\" y=\"310\" font-size=\"40\" fill=\"#e0e0e0\">讲师：孙志岗</text>\n  <text x=\"420\" y=\"400\" font-size=\"30\" fill=\"#cce0ff\">帮助 100 万人顺利走进 AGI 时代</text>\n</svg>\n\n',
      }),
      createExampleElement({
        serialNumber: 1,
        type: "text",
        content:
          "kk，初次见面很高兴，我是孙志岗，AI 师傅的创始人。我曾是哈尔滨工业大学计算机专业的副教授，后来在网易、得到 App 和一家独角兽级创业公司担任过中高管，负责过产品、技术和业务。我的工作领域主要是互联网、人工智能和教育的结合，已经有超过 20 多年的经验。最近几年已经帮助各行各业的几万人转型成 AI 专业人士，还帮助数十家企业成功落地 AI 到生产实践。\n\n在 ChatGPT 问世的第 6 天，我就注册并被深深地震撼。在深入了解这个技术变革之后，我给自己定了一个目标：**帮助 100 万人顺利走进 AGI 时代**\n\n",
        audio_url:
          "https://resource.ai-shifu.cn/tts-audio/3a9bac6e4f8546bfa2607a53dbd4d89e.mp3",
        is_read: true,
        is_checkpoint: false,
        is_show: false,
      }),
      createExampleElement({
        serialNumber: 2,
        type: "html",
        content:
          '<div class=\"w-full h-screen flex flex-col p-[4vmin] bg-white\">\n  <div class=\"flex-1 flex flex-col items-center justify-[safe_center] gap-[4vmin]\">\n    <h1 class=\"text-[4vmin] font-bold text-[#0F63EE]\">三个常见观点，请你判断</h1>\n    <div class=\"w-full grid grid-cols-1 gap-[3vmin]\">\n      <div class=\"p-[3vmin] rounded-[1.5vmin] bg-blue-50 border-2 border-blue-100\">\n        <p class=\"text-[3vmin] leading-[4vmin] text-gray-800\">1. AI 是一种工具</p>\n      </div>\n      <div class=\"p-[3vmin] rounded-[1.5vmin] bg-blue-50 border-2 border-blue-100\">\n        <p class=\"text-[3vmin] leading-[4vmin] text-gray-800\">2. 每种 AI 产品都需要学习使用方法</p>\n      </div>\n      <div class=\"p-[3vmin] rounded-[1.5vmin] bg-blue-50 border-2 border-blue-100\">\n        <p class=\"text-[3vmin] leading-[4vmin] text-gray-800\">3. 打造 AI 产品是技术高手的事情</p>\n      </div>\n    </div>\n  </div>\n</div>\n\n',
      }),
      createExampleElement({
        serialNumber: 3,
        type: "text",
        content:
          "我很想知道你是否同意这几个观点？\n1. AI 是一种工具\n2. 每种 AI 产品都需要学习使用方法\n3. 打造 AI 产品是技术高手的事情",
        audio_url:
          "https://resource.ai-shifu.cn/tts-audio/3bb0ea1263474ed78db21796faac1a13.mp3",
        is_read: true,
        is_checkpoint: false,
        is_show: false,
      }),
      createExampleElement({
        serialNumber: 4,
        type: "interaction",
        content:
          "?[%{{agreeed_points}} AI 是一种工具 || 每种 AI 产品都需要学习使用方法 || 打造 AI 产品是技术高手的事情 || 都不同意 ]",
        user_input: "都不同意",
      }),
      createExampleElement({
        serialNumber: 5,
        type: "diff",
        content:
          '!+++\n--- a/0\n+++ b/0\n@@ -1,8 +1,8 @@\n <div class=\"w-full h-screen flex flex-col p-[4vmin] bg-white\">\n-  <div class=\"flex-1 flex flex-col items-center justify-[safe_center] gap-[4vmin]\">\n+  <div class=\"flex-1 flex flex-col items-center justify-[safe_center] gap-[3vmin]\">\n     <h1 class=\"text-[4vmin] font-bold text-[#0F63EE]\">三个常见观点，请你判断</h1>\n     <div class=\"w-full grid grid-cols-1 gap-[3vmin]\">\n-      <div class=\"p-[3vmin] rounded-[1.5vmin] bg-blue-50 border-2 border-blue-100\">\n+      <div class=\"p-[3vmin] rounded-[1.5vmin] bg-blue-50 border-2 border-[#0F63EE] shadow-lg\">\n         <p class=\"text-[3vmin] leading-[4vmin] text-gray-800\">1. AI 是一种工具</p>\n       </div>\n       <div class=\"p-[3vmin] rounded-[1.5vmin] bg-blue-50 border-2 border-blue-100\">\n!+++\n\n在帮助过几十家企业、上万人用 AI 提升业绩、效率之后，我总结出：这三种观点其实都是多数人都会有的对 AI 的误解。\n\n你真厉害，见识远超普通人！既然你都不同意，说明你对 AI 的认知已经超过了大多数人，这门课整体上可能对你帮助不大，不过某些内容还是可能会给你启发，你可以按需决定要不要继续学习。\n\n非常感谢你的交流，也真诚邀请你继续学习。在帮大家用好 AI 的过程中，我发现：用好 AI 的前提，是你得知道**如何调教 AI**——发挥 AI 的长处，弥补 AI 的短处。调教好了，一句话就能让 AI 帮你搞定所有繁琐工作。\n\n这门课讲的就是如何调教 AI，帮你成为 AI 的真正主人。而且调教的思路非常符合人的直觉，最核心的只需要理解三件事：\n\n<svg width=\"100%\" viewBox=\"0 0 1000 550\" xmlns=\"http://www.w3.org/2000/svg\" style=\"width: 100%; height: auto; aspect-ratio: 1000 / 550;\">\n  <rect width=\"100%\" height=\"100%\" fill=\"#ffffff\"/>\n  <circle cx=\"80\" cy=\"100\" r=\"50\" fill=\"#0F63EE\"/>\n  <text x=\"80\" y=\"110\" text-anchor=\"middle\" font-size=\"36\" fill=\"white\">1</text>\n  <rect x=\"160\" y=\"60\" width=\"780\" height=\"80\" rx=\"15\" fill=\"#f0f6ff\" stroke=\"#0F63EE\" stroke-width=\"2\"/>\n  <text x=\"180\" y=\"105\" font-size=\"24\" fill=\"#0a2463\">明白 AI 的一切表现都是概率的结果</text>\n\n  <circle cx=\"80\" cy=\"250\" r=\"50\" fill=\"#0F63EE\"/>\n  <text x=\"80\" y=\"260\" text-anchor=\"middle\" font-size=\"36\" fill=\"white\">2</text>\n  <rect x=\"160\" y=\"210\" width=\"780\" height=\"80\" rx=\"15\" fill=\"#f0f6ff\" stroke=\"#0F63EE\" stroke-width=\"2\"/>\n  <text x=\"180\" y=\"255\" font-size=\"24\" fill=\"#0a2463\">知道 AI 的知识来自哪里</text>\n\n  <circle cx=\"80\" cy=\"400\" r=\"50\" fill=\"#0F63EE\"/>\n  <text x=\"80\" cy=\"410\" text-anchor=\"middle\" font-size=\"36\" fill=\"white\">3</text>\n  <rect x=\"160\" y=\"360\" width=\"780\" height=\"80\" rx=\"15\" fill=\"#f0f6ff\" stroke=\"#0F63EE\" stroke-width=\"2\"/>\n  <text x=\"180\" y=\"405\" font-size=\"24\" fill=\"#0a2463\">知道如何操纵 AI 的记忆</text>\n</svg>\n\n',
      }),
      createExampleElement({
        serialNumber: 6,
        type: "text",
        audio_url:
          "https://resource.ai-shifu.cn/tts-audio/f949d0729a5d47adb70a249e4a850058.mp3",
        is_read: true,
        is_checkpoint: false,
        is_show: false,
        content:
          '我来简单给你解释一下：\n- **AI 一切都是概率结果**：AI 不会像计算器一样给你\"绝对正确\"的答案，它是根据训练数据猜下一个字，理解了这件事，你就不会迷信 AI 的输出，会懂得怎么验证、怎么修正结果。\n- **AI 的知识从哪来**：AI 不会凭空创造知识，它所有的认知都来自训练数据。你得搞懂它的知识边界，才知道什么时候能信它，什么时候要提醒它补新知识。\n- **操纵 AI 的记忆**：AI 没有真正的长期记忆，但我们可以通过提示词、上下文把需要的信息喂给它。学会这招，AI 就能一直记住你的需求、你的习惯，用起来越用越顺手。',
      }),
      createExampleElement({
        serialNumber: 7,
        type: "text",
        content:
          "你可能还没注意到：**咱们这门用 AI 师傅制作的课，本身就是 AI 适应人的最好例证**。\n\n你现在看到的一切，都不是提前写死的固定内容，而是由 AI 此时此刻给你量身定制的。而且了解你的喜好和个人情况越多，给你做的个性化讲课就越精准，学习体验和效果自然也就越好。\n\n但这和 ChatGPT 那种纯对话 AI 差别很大：虽然内容都是 AI 实时生成的，但并不是 AI 凭空瞎编，而是在后台被我严格约束了教学逻辑——该讲什么、怎么讲，哪里必须严谨，哪里可以灵活发挥，全都是受我的严格控制。打个比方：AI 就像是我亲自培训出来的助教，我把核心知识和讲课逻辑都教给它，它再按照你的情况，把内容用最适合你的方式讲出来，既保证内容准确权威，又能最大化发挥 AI 的优势。\n\n对了，你希望我怎么称呼你？",
        audio_url:
          "https://resource.ai-shifu.cn/tts-audio/7c04ca6357ba4ad1b0935a9afba37ca9.mp3",
        is_read: true,
        is_checkpoint: false,
        is_show: false,
      }),
      createExampleElement({
        serialNumber: 8,
        type: "interaction",
        content: "?[%{{sys_user_nickname}}...我可以怎样称呼你？]",
        user_input: "kk",
      }),
      createExampleElement({
        serialNumber: 9,
        type: "svg",
        content:
          '<svg width="100%" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; aspect-ratio: 800 / 400;">\n  <defs>\n    <linearGradient id="welcomeBg" x1="0%" y1="0%" x2="100%" y2="100%">\n      <stop offset="0%" stop-color="#0F63EE"/>\n      <stop offset="100%" stop-color="#4a8bff"/>\n    </linearGradient>\n  </defs>\n  <rect width="100%" height="100%" fill="url(#welcomeBg)"/>\n  <text id="welcome" x="400" y="160" text-anchor="middle" font-size="60" fill="white" font-weight="bold">欢迎你，</text>\n  <text id="name" x="400" y="240" text-anchor="middle" font-size="80" fill="white" font-weight="bold">kk</text>\n  <text id="wave" x="680" y="340" text-anchor="middle" font-size="50" fill="white">👋</text>\n  <script type="text/javascript"><![CDATA[\n    let scale = 1;\n    let growing = false;\n    function animate() {\n      if(growing) {\n        scale += 0.01;\n        if(scale >= 1.2) growing = false;\n      } else {\n        scale -= 0.01;\n        if(scale <= 0.9) growing = true;\n      }\n      name.setAttribute(\'transform\', `scale(${scale}) translate(-400 -240)`);\n      requestAnimationFrame(animate);\n    }\n    animate();\n    let waveRotate = 0;\n    function waveAnimate() {\n      waveRotate += 2;\n      wave.setAttribute(\'transform\', `rotate(${waveRotate} 680 340)`);\n      requestAnimationFrame(waveAnimate);\n    }\n    waveAnimate();\n  ]]></script>\n</svg>\n\n',
      }),
      createExampleElement({
        serialNumber: 10,
        type: "text",
        content:
          "哈喽 kk，你的名字真好听，简洁好记又响亮，一下就记在我脑子里啦！\n\n为了让课程里的所有案例都更贴合你的情况，我需要简单了解一下你现在是做什么的。麻烦你从行业、岗位、工作年限、当前状态这些角度，详细介绍一下自己，越详细越好，比如这样：\n1. 我是互联网行业运营，做了 5 年，现在是运营主管，想靠 AI 做内容提升效率，再接兼职赚钱\n2. 我是大学应届毕业生，学的是汉语言文学，还没找到工作，想靠 AI 接单做文案\n3. 我全职在家带娃 5 年，之前做过行政，现在想试试做 AI 相关的副业增加收入\n\n请你一定要告诉我你的真实情况，这样后面我才能完全按照你的情况调整讲课内容，给你最适配的学习体验。",
        audio_url:
          "https://resource.ai-shifu.cn/tts-audio/8ff97c75dd454a6585d195901219d055.mp3",
        is_read: true,
        is_checkpoint: false,
        is_show: false,
      }),
      createExampleElement({
        serialNumber: 11,
        type: "interaction",
        content:
          "?[%{{sys_user_background}}我不告诉你 | ...你的身份背景、当前状态如何？]",
        user_input: "我不告诉你",
      }),
      createExampleElement({
        serialNumber: 12,
        type: "text",
        content:
          "哈哈，没关系，保持神秘感也挺好，我懂！不提前说透反而能碰撞出更多惊喜，这种松弛感我太喜欢了。不过也正好，咱们今天就聊点通用的——不管你是什么背景，AI 能帮你的大方向其实都是一样的。\n\n",
        audio_url:
          "https://resource.ai-shifu.cn/tts-audio/3a4fb5e4da8c4eb988b4a840aaaf9b21.mp3",
        is_read: true,
        is_checkpoint: false,
        is_show: false,
      }),
      createExampleElement({
        serialNumber: 13,
        type: "svg",
        content:
          '<svg width=\"100%\" viewBox=\"0 0 1000 600\" xmlns=\"http://www.w3.org/2000/svg\" style=\"width: 100%; height: auto; aspect-ratio: 1000 / 600;\">\n  <defs>\n    <linearGradient id=\"timeline\" x1=\"0%\" y1=\"0\" x2=\"0\" y2=\"100%\">\n      <stop offset=\"0%\" stop-color=\"#0F63EE\"/>\n      <stop offset=\"100%\" stop-color=\"#073482\"/>\n    </linearGradient>\n  </defs>\n  <rect width=\"100%\" height=\"100%\" fill=\"#ffffff\"/>\n  <text x=\"50\" y=\"50\" font-size=\"36\" font-weight=\"bold\" fill=\"#0F63EE\">AI 对普通人的价值时间线</text>\n  <rect x=\"100\" y=\"80\" width=\"10\" height=\"480\" fill=\"url(#timeline)\"/>\n  \n  <!-- 当前 -->\n  <circle cx=\"105\" cy=\"140\" r=\"15\" fill=\"#ffffff\" stroke=\"#0F63EE\" stroke-width=\"3\"/>\n  <rect x=\"140\" y=\"100\" width=\"800\" height=\"80\" rx=\"12\" fill=\"#f0f6ff\" stroke=\"#0F63EE\" stroke-width=\"2\"/>\n  <text x=\"160\" y=\"145\" font-size=\"24\" fill=\"#0a2463\">当下：当副业赚零花钱，提升本职工作效率</text>\n\n  <!-- 2-3年 -->\n  <circle cx=\"105\" cy=\"280\" r=\"15\" fill=\"#ffffff\" stroke=\"#0F63EE\" stroke-width=\"3\"/>\n  <rect x=\"140\" y=\"240\" width=\"800\" height=\"80\" rx=\"12\" fill=\"#f0f6ff\" stroke=\"#0F63EE\" stroke-width=\"2\"/>\n  <text x=\"160\" y=\"285\" font-size=\"24\" fill=\"#0a2463\">2 - 3 年：AI 会成为你的职业护城河，拉开和普通人的差距</text>\n\n  <!-- 4-5年 -->\n  <circle cx=\"105\" cy=\"420\" r=\"15\" fill=\"#ffffff\" stroke=\"#0F63EE\" stroke-width=\"3\"/>\n  <rect x=\"140\" y=\"380\" width=\"800\" height=\"80\" rx=\"12\" fill=\"#f0f6ff\" stroke=\"#0F63EE\" stroke-width=\"2\"/>\n  <text x=\"160\" y=\"425\" font-size=\"24\" fill=\"#0a2463\">4 - 5 年（AGI 落地后）：提前掌握 AI 思维，就是拿到了新时代船票</text>\n</svg>\n\n',
      }),
      createExampleElement({
        serialNumber: 14,
        type: "text",
        audio_url:
          "https://resource.ai-shifu.cn/tts-audio/783eb8c83fef4af19c1582a87f5f81c4.mp3",
        is_read: true,
        is_checkpoint: false,
        is_show: false,
        content:
          "我来给你拆解一下这条时间线：\n\n1. **当下**：对想做副业的你来说，现在就是最好的入场时机。现在 AI 人才缺口极大，不管是帮人做提示词、做 AI 应用方案，还是用 AI 生产内容接单，都能直接赚到零花钱。哪怕你不打算做副业，用 AI 帮自己的本职工作提效，也能早点下班多陪家人，或者省出时间干更多自己想干的事。\n\n2. **2-3 年之后**：AI 会变成职场人的标配，但**早学会和被迫接受，完全是两码事**。现在就入门的你，早就摸透了 AI 的脾气，知道怎么让它帮你干活，而那些抵触 AI 不愿意学的人，只会被时代甩在后面。这两三年的先发优势，就是你最稳的职业护城河，差距一旦拉开，再追就难了。\n\n3. **按照行业预测，AGI 大概率会在 5 年内落地**，到那个时候，整个社会的生产方式都会彻底重构。很多现在的岗位会彻底消失，新的岗位会源源不断冒出来。提前掌握了 AI 思维，懂怎么和 AI 协作、怎么用 AI 解决问题，你就相当于提前拿到了新时代的船票，不管浪怎么拍，你都能站在船头，而不是被拍在沙滩上。\n\n说了这么多，你来说说：你希望 AI 能帮自己解决什么具体问题？我后面的课程就围绕这个目标给你讲。",
      }),
      createExampleElement({
        serialNumber: 11,
        type: "interaction",
        content: "?[%{{purpose}} 还没想好 |...学 AI 的目的是什么？]",
        user_input: "",
      }),
    ],
  },
  render: (args) => (
    <div className="flex h-[100dvh] w-full items-center justify-center border-b border-dashed border-border bg-muted/20">
      <Slide className="w-full" {...args} />
    </div>
  ),
};
