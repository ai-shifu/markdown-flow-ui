import { describe, expect, it } from "vitest";

import { splitContentSegments } from "../../../src/components/ContentRender/utils/split-content";

describe("splitContentSegments", () => {
  it("split img content", () => {
    const raw = `好的，我将重点介绍**KFC**菜系的年夜饭，列举几道**KFC**家喻户晓的菜品和对应的吉祥寓意，也提及一些其他菜系的吉祥寓意。

# 看看各地年夜饭
![gLwpjL4TPXH7zeLZm0COtuPtMUYMqtEVQ90mkYsYW1CaKF3WiTGKFQQjvS4o_t_2.jpg](https://qcloud.dpfile.com/pc/gLwpjL4TPXH7zeLZm0COtuPtMUYMqtEVQ90mkYsYW1CaKF3WiTGKFQQjvS4o_t_2.jpg)
这是第一个图
![u=3218772997,2773853737&fm=253&app=138&f=JPEG](https://img1.baidu.com/it/u=3218772997,2773853737&fm=253&app=138&f=JPEG?w=800&h=1069)
这是第二个图
![0362cc654dd73d878e594df645c1cae2.jpeg](https://pic.rmb.bdstatic.com/bjh/down/0362cc654dd73d878e594df645c1cae2.jpeg)
这是第三个图

这三张图片展现了不同风格的年夜饭，挺有意思的。

第一张图（圆桌摆盘）是**非常经典的传统中式年夜饭**。大圆桌上摆满了盘碟，中间通常是一条完整的鱼，还有整鸡、扣肉等“硬菜”。餐具讲究，氛围正式，一看就是大家庭的隆重聚餐，强调**团圆、丰盛和仪式感**。

第二张图（红色背景食物）更像是**餐厅或外卖的“年夜饭套餐”**。菜品摆盘精致，有龙虾、鲍鱼等高档食材，用红色背景和“福”字装饰突出节日气氛。这反映了现代趋势：很多家庭选择在餐厅吃或订购半成品套餐，追求**便捷、高品质和视觉上的喜庆**。

第三张图（家庭聚餐）捕捉了**最真实、最温馨的家庭聚餐瞬间**。桌上菜品看起来家常但丰盛，家人围坐，举杯庆祝，背景是普通的家居环境。这种风格强调的是**亲情、放松和共享的温暖**，是年夜饭最核心的情感价值。

**88**，你提到的**KFC“菜系”**，其实反映了年夜饭的另一种现代变迁——**便捷化与全球化**。虽然它并非传统中餐，但确实成为了一些年轻家庭或城市快节奏生活中的一种轻松选择。我们可以给它赋予一些有趣的“吉祥寓意”：
*   **黄金脆皮鸡/原味鸡**：金黄酥脆，寓意 **“家肥屋润”、“金光闪闪”** ，象征财富。
*   **香辣鸡腿堡**：层层叠叠，食材丰富，寓意 **“包罗万有”、“步步高升”** 。
*   **薯条**：一根根条状，金黄挺拔，可以联想为 **“金条”、“条条大路通财富”** 。
*   **可乐/九珍果汁**：气泡升腾或色彩缤纷，寓意 **“喜气洋洋”、“生活多彩”** 。

当然，这只是趣味解读。传统菜系的寓意则深厚得多：
*   **鱼**：**“年年有余”**，吃剩一点，象征财富富余。
*   **鸡**：**“吉祥如意”**，尤其整鸡代表“有头有尾”。
*   **饺子/汤圆**：形状像元宝或团团圆圆，寓意 **“招财进宝”、“团团圆圆”** 。
*   **年糕**：**“年年高升”**，事业学业进步。
*   **发菜蚝豉**：谐音 **“发财好市”** ，生意兴隆。

**年夜饭礼仪**核心在于 **“敬”与“和”**：
1.  **座次有序**：长辈或一家之主坐主位。
2.  **长辈先动筷**：开席前通常由长辈先说几句祝福的话，并先动筷。
3.  **吃饭不说不吉话**：避免说“破”、“坏”、“没了”等字眼。
4.  **主动敬酒（茶）**：晚辈向长辈敬酒或敬茶，表达敬意和祝福。
5.  **不翻鱼**：吃鱼时，将上面一半吃完后，用筷子把鱼骨剔掉再吃下半，而不是把鱼整个翻过来，寓意“不翻船”，行事顺利。

<svg width="100%" height="300" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="800" height="300" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
    <!-- 时间轴线 -->
    <line x1="50" y1="150" x2="750" y2="150" stroke="#adb5bd" stroke-width="2"/>
    <!-- 古代 -->
    <g>
        <circle cx="150" cy="150" r="12" fill="#0F63EE"/>
        <rect x="100" y="80" width="100" height="40" rx="5" fill="#e9ecef" stroke="#adb5bd" stroke-width="1"/>
        <text x="150" y="105" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#212529">祭祀性</text>
        <text x="150" y="185" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#0F63EE" font-weight="bold">古代</text>
        <text x="150" y="205" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#495057">感恩祈福<br>仪式庄重</text>
        <line x1="150" y1="162" x2="150" y2="175" stroke="#0F63EE" stroke-width="1"/>
    </g>
    <!-- 近代 -->
    <g>
        <circle cx="350" cy="150" r="12" fill="#0F63EE"/>
        <rect x="300" y="80" width="100" height="40" rx="5" fill="#e9ecef" stroke="#adb5bd" stroke-width="1"/>
        <text x="350" y="105" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#212529">家庭性</text>
        <text x="350" y="185" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#0F63EE" font-weight="bold">近代</text>
        <text x="350" y="205" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#495057">家族团圆<br>伦理核心</text>
        <line x1="350" y1="162" x2="350" y2="175" stroke="#0F63EE" stroke-width="1"/>
    </g>
    <!-- 现代 -->
    <g>
        <circle cx="550" cy="150" r="12" fill="#0F63EE"/>
        <rect x="500" y="80" width="100" height="40" rx="5" fill="#e9ecef" stroke="#adb5bd" stroke-width="1"/>
        <text x="550" y="105" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#212529">多元化</text>
        <text x="550" y="185" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#0F63EE" font-weight="bold">现代</text>
        <text x="550" y="205" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#495057">便捷体验<br>个性选择</text>
        <line x1="550" y1="162" x2="550" y2="175" stroke="#0F63EE" stroke-width="1"/>
    </g>
    <!-- 未来趋势 -->
    <g>
        <circle cx="700" cy="150" r="12" fill="#0F63EE" fill-opacity="0.7" stroke="#0F63EE" stroke-width="2" stroke-dasharray="4"/>
        <rect x="670" y="80" width="60" height="40" rx="5" fill="#f8f9fa" stroke="#adb5bd" stroke-width="1" stroke-dasharray="4"/>
        <text x="700" y="105" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#868E96">健康/科技</text>
        <text x="700" y="185" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#868E96">趋势</text>
        <text x="700" y="205" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#868E96">绿色智能<br>文化融合</text>
        <line x1="700" y1="162" x2="700" y2="175" stroke="#868E96" stroke-width="1" stroke-dasharray="4"/>
    </g>
    <text x="400" y="280" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#0F63EE" font-weight="bold">年夜饭核心寓意演变趋势</text>
</svg>

上图展示了年夜饭核心寓意的演变。**88**，我们可以这样理解：`;
    const segments = splitContentSegments(raw, true);
    console.log("segments", segments);
    expect(segments).toHaveLength(9);
    expect(segments[0].type).toBe("text");
    expect(segments[0].value).toContain(
      `好的，我将重点介绍**KFC**菜系的年夜饭，列举几道**KFC**家喻户晓的菜品和对应的吉祥寓意，也提及一些其他菜系的吉祥寓意。`
    );
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain(
      `![gLwpjL4TPXH7zeLZm0COtuPtMUYMqtEVQ90mkYsYW1CaKF3WiTGKFQQjvS4o_t_2.jpg](https://qcloud.dpfile.com/pc/gLwpjL4TPXH7zeLZm0COtuPtMUYMqtEVQ90mkYsYW1CaKF3WiTGKFQQjvS4o_t_2.jpg)`
    );
    expect(segments[2].type).toBe("text");
    expect(segments[2].value).toContain("这是第一个图");
    expect(segments[3].type).toBe("markdown");
    expect(segments[3].value).toContain(
      `![u=3218772997,2773853737&fm=253&app=138&f=JPEG](https://img1.baidu.com/it/u=3218772997,2773853737&fm=253&app=138&f=JPEG?w=800&h=1069)`
    );
    expect(segments[4].type).toBe("text");
    expect(segments[4].value).toContain("这是第二个图");
    expect(segments[5].type).toBe("markdown");
    expect(segments[5].value).toContain(
      "![0362cc654dd73d878e594df645c1cae2.jpeg](https://pic.rmb.bdstatic.com/bjh/down/0362cc654dd73d878e594df645c1cae2.jpeg)"
    );
    expect(segments[6].type).toBe("text");
    expect(segments[6].value).toContain("这是第三个图");
    expect(segments[7].type).toBe("markdown");
    expect(segments[7].value).toContain(
      `<svg width="100%" height="300" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">`
    );
    expect(segments[8].type).toBe("text");
    expect(segments[8].value).toContain(
      "上图展示了年夜饭核心寓意的演变。**88**，我们可以这样理解："
    );
  });
  it("split video content", () => {
    const raw = `先说一下这是第二个块的开始

<iframe data-tag="video" data-title="哔哩哔哩视频" data-url="春节的由来_哔哩哔哩_bilibili" class="w-full aspect-video rounded-lg border-0" src="https://player.bilibili.com/player.html?bvid=BV1x84y187yS&amp;autoplay=0" allowfullscreen="" allow="autoplay; encrypted-media"></iframe>

这个动画视频用生动有趣的画面和通俗易懂的旁白，讲述了“年”兽的传说和春节的起源，非常适合**略知一二**的观众。它直观地展示了**红色、火光和响声**如何驱赶年兽，将传统故事与现代动画形式结合，让春节的由来变得鲜活有趣，易于理解和记忆。

接下来，我们继续探索春节的传统历史。

春节的习俗历经千年演变，不同时期各有特色。下面的表格对比了不同历史时期的主要习俗，你可以点击或悬停查看详细信息。

| 时期 | 主要特点 | 详细信息 |
| :--- | :--- | :--- |
| **古代 (唐宋及以前)** | **驱邪纳福，祭祀为重** | 习俗多与驱赶“年”兽等邪祟、祭祀祖先神灵相关。**燃放爆竹**（烧竹子）以吓退山魈恶鬼，**挂桃符**（后演变为春联）以辟邪。**守岁**习俗在唐代已盛行，全家团聚，终夜不眠，以待新年。拜年主要是向家族尊长行礼祈福。 |
| **近代 (明清至民国)** | **礼仪完善，喜庆团圆** | 习俗的礼仪性和家庭团聚色彩更浓。**贴春联**完全普及，文字内容更讲究文采与吉祥寓意。**年夜饭**成为核心家庭活动，极其丰盛，象征团圆富足。**压岁钱**从最初的压祟驱邪，逐渐变为长辈给晚辈的祝福。庙会、舞龙舞狮等公共庆祝活动非常热闹。 |
| **现代 (当代至今)** | **传统融合，形式多元** | 在传承核心传统的基础上，形式更加多样和便捷。**放鞭炮**在许多城市受限，电子鞭炮、灯光秀成为新选择。**拜年**方式从上门走访扩展到电话、短信、微信视频拜年。**春节联欢晚会**成为新的“守岁”方式。旅游过年、线上抢红包等新习俗出现，但**阖家团圆、辞旧迎新**的内核始终未变。 |

这张表格概括了春节习俗演变的主线。对于**略知一二**的你，**88**，我们接下来重点讲讲今天依然鲜活的核心习俗及其意义：

*   **贴春联、福字、年画**：这起源于古代的“桃符”，人们认为桃木能辟邪。后来写上吉祥话，就成了春联。贴上它们，意味着**驱走旧年的晦气，迎来新年的福气**。倒贴“福”字，寓意“福到了”。
*   **放鞭炮**：直接源于驱赶“年”兽的传说。爆竹声声，是为了**吓退邪祟，用热闹迎接吉祥**。虽然现在很多地方禁止燃放，但它响彻云霄的意象早已深入人心。
*   **吃年夜饭**：这是春节**最核心、最温暖的仪式**。无论多远，家人都要赶回来，围坐一桌，共享丰盛佳肴。它象征着**家庭团圆、和睦美满**，饭菜里饱含着对过去一年的慰劳和对新一年的期盼。
*   **守岁**：除夕夜全家聚在一起，通宵不眠，等待新年的钟声。寓意着**珍惜光阴，为长辈祈福延寿**，也寄托着对新年美好的守望。
*   **拜年**：大年初一，人们穿上新衣，走亲访友，互相道贺“新年好”。这是**表达美好祝愿、增进亲情友情**的重要时刻。晚辈给长辈拜年，长辈则给予压岁钱，寓意**镇恶驱邪，保佑平安**。

![v2-36cc97a3a8ec8942a57cd2052097b01a_r.jpg](https://picx.zhimg.com/v2-36cc97a3a8ec8942a57cd2052097b01a_r.jpg?source=2c26e567)

这张图片生动地捕捉了传统春节的典型场景：画面中央是戴着虎头帽、穿着棉袄的可爱孩童，他正在点燃地上的爆竹，脸上洋溢着兴奋和期待。背景是贴着春联和门神的古朴木门，以及悬挂的红灯笼，充满了浓郁的**年味和喜庆氛围**。图片色彩鲜艳，以红色和金色为主，构图温馨，很好地体现了春节**热闹、祥和、充满童趣**的一面。`;

    const segments = splitContentSegments(raw, true);
    // console.log('segments', segments);
    expect(segments).toHaveLength(7);
    expect(segments[0].type).toBe("text");
    expect(segments[0].value).toBe("先说一下这是第二个块的开始");
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toBe(
      `<iframe data-tag="video" data-title="哔哩哔哩视频" data-url="春节的由来_哔哩哔哩_bilibili" class="w-full aspect-video rounded-lg border-0" src="https://player.bilibili.com/player.html?bvid=BV1x84y187yS&amp;autoplay=0" allowfullscreen="" allow="autoplay; encrypted-media"></iframe>`
    );
    expect(segments[2].type).toBe("text");
    expect(segments[2].value).toContain(
      "这个动画视频用生动有趣的画面和通俗易懂的旁白，讲述了“年”兽的传说和春节的起源，非常适合"
    );
    expect(segments[3].type).toBe("markdown");
    expect(segments[3].value).toContain(`| 时期 | 主要特点 | 详细信息 |`);
    expect(segments[4].type).toBe("text");
    expect(segments[4].value).toContain(
      "这张表格概括了春节习俗演变的主线。对于"
    );
    expect(segments[5].type).toBe("markdown");
    expect(segments[5].value).toBe(
      `![v2-36cc97a3a8ec8942a57cd2052097b01a_r.jpg](https://picx.zhimg.com/v2-36cc97a3a8ec8942a57cd2052097b01a_r.jpg?source=2c26e567)`
    );
    expect(segments[6].type).toBe("text");
    expect(segments[6].value).toContain(
      "这张图片生动地捕捉了传统春节的典型场景：画面中央是戴着虎头帽、穿着棉袄的可爱孩童，他正在点燃地上的爆竹，脸上洋溢着兴奋和期待。背景是贴着春联和门神的古朴木门，以及悬挂的红灯笼，充满了浓郁的**年味和喜庆氛围**。图片色彩鲜艳，以红色和金色为主，构图温馨，很好地体现了春节**热闹、祥和、充满童趣**的一面。"
    );
  });
  it("splits content into segments", () => {
    const raw = `先说一下这是第六个块的开始

本次春节文化之旅的学习路径，可以清晰地用以下流程图来展示：

\`\`\`mermaid
flowchart TD
    A[“了解用户背景<br>（知识水平、地区兴趣）”] --> B[“讲解春节由来<br>（起源、年兽传说、历法）”]
    B --> C[“探索传统历史<br>（习俗演变、核心活动）”]
    C --> D[“介绍各地风俗<br>（重点：西部地区特色）”]
    D --> E[“深入年夜饭与烟花<br>（饮食文化、节日象征）”]
    E --> F[“总结文化意义<br>（核心价值与个性化启示）”]
\`\`\`

先说一下这是最后一个块的开始

**春节文化意义总结**

kk，通过这次旅程，我们一起揭开了春节神秘而温暖的面纱。作为中国最重要、最隆重的传统节日，它的核心价值在于：

1.  **家庭团聚的仪式**：无论身处何方，春节就像一块巨大的磁石，将家人吸引回同一张饭桌前。对于操持家庭的您来说，这正是一年辛勤付出后，收获**亲情环绕**的最高奖赏。
2.  **文化传承的课堂**：从贴春联、放鞭炮到准备一桌寓意深刻的年夜饭，每一个习俗都是一颗文化的种子。您带着孩子参与其中，就是在进行最生动的**文化传承**。
3.  **辞旧迎新的心理节点**：它象征着与过去一年的告别，和对新一年的美好憧憬。燃放烟花（或观看电子烟花）的那一刻，正是这种**焕新与希望**情绪最直接的释放。

结合您 **“完全不了解”** 的起点和对 **“西部地区（如四川、云南）”** 的兴趣，这次旅程为您打开了一扇窗。您看到了春节从古老的祭祀演变为充满温情的家庭节日，也领略了西部热烈多彩的“年味”。希望这能鼓励您，未来可以更深入地去体验，比如尝试制作一道**四川腊肉**，或者关注一次本地的**元宵灯会**，将知识转化为亲身感受的温暖记忆。

最后，为您送上一份诚挚的新年祝福动画：

<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#FFF8E1"/>
    <!-- 灯笼 -->
    <rect x="180" y="80" width="40" height="60" fill="#F44336"/>
    <rect x="185" y="70" width="30" height="10" fill="#FF9800"/>
    <rect x="190" y="140" width="20" height="20" fill="#FFEB3B">
        <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite"/>
    </rect>
    <text x="200" y="165" text-anchor="middle" font-family="SimHei, sans-serif" font-size="12" fill="#333">福</text>

    <!-- 祝福语 -->
    <text x="200" y="220" text-anchor="middle" font-family="SimHei, sans-serif" font-size="20" fill="#D32F2F" font-weight="bold">
        <animate attributeName="opacity" values="0;1" dur="2s" fill="freeze"/>
        新年快乐
    </text>
    <text x="200" y="250" text-anchor="middle" font-family="SimHei, sans-serif" font-size="16" fill="#0F63EE">
        <animate attributeName="opacity" values="0;1" dur="2s" begin="0.5s" fill="freeze"/>
        阖家幸福，万事如意！
    </text>

    <!-- 装饰彩带 -->
    <line x1="50" y1="50" x2="150" y2="100" stroke="#4CAF50" stroke-width="2" stroke-dasharray="5,5">
        <animate attributeName="x2" values="150;160;150" dur="2s" repeatCount="indefinite"/>
    </line>
    <line x1="350" y1="50" x2="250" y2="100" stroke="#FF9800" stroke-width="2" stroke-dasharray="5,5">
        <animate attributeName="x2" values="250;240;250" dur="2s" repeatCount="indefinite"/>
    </line>
</svg>

**kk，愿您和您的家人，在新的一年里，身体健康，生活像春节的年夜饭一样丰盛美满，每一天都充满温馨与欢笑！**`;
    const segments = splitContentSegments(raw, true);
    // console.log('segments', segments);
    expect(segments).toHaveLength(5);
    expect(segments[0].type).toBe("text");
    expect(segments[0].value).toBe("先说一下这是第六个块的开始");
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toBe(
      "```mermaid\nflowchart TD\n    A[“了解用户背景<br>（知识水平、地区兴趣）”] --> B[“讲解春节由来<br>（起源、年兽传说、历法）”]\n    B --> C[“探索传统历史<br>（习俗演变、核心活动）”]\n    C --> D[“介绍各地风俗<br>（重点：西部地区特色）”]\n    D --> E[“深入年夜饭与烟花<br>（饮食文化、节日象征）”]\n    E --> F[“总结文化意义<br>（核心价值与个性化启示）”]\n\`\`\`"
    );
    expect(segments[2].type).toBe("text");
    expect(segments[2].value).toContain("先说一下这是最后一个块的开始");
    expect(segments[3].type).toBe("markdown");
    expect(segments[3].value).toContain(
      `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">`
    );
    expect(segments[4].type).toBe("text");
    expect(segments[4].value).toContain(
      "kk，愿您和您的家人，在新的一年里，身体健康，生活像春节的年夜饭一样丰盛美满，每一天都充满温馨与欢笑！"
    );
  });

  it("keeps inline svg and fenced code as markdown segments", () => {
    const raw =
      "```mermaid\ngraph TD\n    subgraph 大语言模型的诞生\n        A[初始模型<br>空白的“大脑”] --> B[预训练<br>海量数据“上学”]\n        B --> C[后训练<br>对齐与微调]\n        C --> D[大语言模型<br>具备语言与知识]\n    end\n```\n\n你有没有想过，为什么一夜之间，好像全世界都在谈论“大模型”？\n\n伴随 ChatGPT 一起爆火的，AI 真的和人很像。";

    const segments = splitContentSegments(raw);

    expect(segments).toHaveLength(1);
    segments.forEach((segment) => expect(segment.type).toBe("markdown"));
    expect(segments[0].value).toContain("```mermaid");
    expect(segments[0].value).not.toContain(
      "你有没有想过，为什么一夜之间，好像全世界都在谈论“大模型”？"
    );
  });

  it("splits true html blocks into sandbox when keepText is true", () => {
    const raw = `<div style="width: 100%; overflow-x: auto;">
<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="800" height="400" fill="#F8FAFC" rx="8"/>
    <rect x="100" y="280" width="600" height="80" fill="#0F63EE" rx="8"/>
    <text x="400" y="320" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">AI师傅平台基础能力</text>
    <rect x="150" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="200" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">用户互动</text>
    <rect x="275" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="325" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">输出给AI</text>
    <rect x="400" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="450" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">AI判断</text>
    <rect x="525" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="575" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">AI输出</text>
    <line x1="200" y1="280" x2="200" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <line x1="325" y1="280" x2="325" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <line x1="450" y1="280" x2="450" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <line x1="575" y1="280" x2="575" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <rect x="250" y="120" width="120" height="60" fill="#0F63EE" rx="8"/>
    <text x="310" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">教学</text>
    <rect x="430" y="120" width="120" height="60" fill="#0F63EE" rx="8"/>
    <text x="490" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">测评</text>
    <line x1="310" y1="180" x2="310" y2="240" stroke="#0F63EE" stroke-width="2" stroke-dasharray="5,5"/>
    <line x1="490" y1="180" x2="490" y2="240" stroke="#0F63EE" stroke-width="2" stroke-dasharray="5,5"/>
</svg>
</div>

前面内容介绍了如何用 AI 师傅平台进行教学，本小节我们重点介绍如何用 AI 师傅平台进行测评。

在 AI 师傅平台上进行测评，核心依然是结合平台本身的基础能力。聚焦到**随堂测验**这个场景，流程可以概括为：

1.  **大模型出题**：基于课程内容和你的背景（虽然你不告诉我具体是什么，但系统会基于你设定的背景来生成题目），AI 会生成个性化的测验题目。
2.  **学员互动答题**：kk，你会通过互动的方式（如选择题、填空题、问答题等）来回答问题。
3.  **大模型判题**：AI 会分析你的答案，进行判断，并给出反馈。

整个过程充分利用了平台的**用户互动、输出给 AI、AI 判断、AI 输出**这些核心能力，为你提供即时、个性化的学习效果检验。`;

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(2);
    expect(segments[0].type).toBe("sandbox");
    expect(segments[0].value).toContain(
      '<div style="width: 100%; overflow-x: auto;">'
    );
    expect(segments[1].type).toBe("text");
    expect(segments[1].value).toContain(
      "前面内容介绍了如何用 AI 师傅平台进行教学，本小节我们重点介绍如何用 AI 师傅平台进行测评。"
    );
  });

  it("splits true html blocks into sandbox when keepText is false", () => {
    const raw = `<div style="width: 100%; overflow-x: auto;">
<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="800" height="400" fill="#F8FAFC" rx="8"/>
    <rect x="100" y="280" width="600" height="80" fill="#0F63EE" rx="8"/>
    <text x="400" y="320" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">AI师傅平台基础能力</text>
    <rect x="150" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="200" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">用户互动</text>
    <rect x="275" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="325" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">输出给AI</text>
    <rect x="400" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="450" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">AI判断</text>
    <rect x="525" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="575" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">AI输出</text>
    <line x1="200" y1="280" x2="200" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <line x1="325" y1="280" x2="325" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <line x1="450" y1="280" x2="450" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <line x1="575" y1="280" x2="575" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <rect x="250" y="120" width="120" height="60" fill="#0F63EE" rx="8"/>
    <text x="310" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">教学</text>
    <rect x="430" y="120" width="120" height="60" fill="#0F63EE" rx="8"/>
    <text x="490" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">测评</text>
    <line x1="310" y1="180" x2="310" y2="240" stroke="#0F63EE" stroke-width="2" stroke-dasharray="5,5"/>
    <line x1="490" y1="180" x2="490" y2="240" stroke="#0F63EE" stroke-width="2" stroke-dasharray="5,5"/>
</svg>
</div>

前面内容介绍了如何用 AI 师傅平台进行教学，本小节我们重点介绍如何用 AI 师傅平台进行测评。

在 AI 师傅平台上进行测评，核心依然是结合平台本身的基础能力。聚焦到**随堂测验**这个场景，流程可以概括为：

1.  **大模型出题**：基于课程内容和你的背景（虽然你不告诉我具体是什么，但系统会基于你设定的背景来生成题目），AI 会生成个性化的测验题目。
2.  **学员互动答题**：kk，你会通过互动的方式（如选择题、填空题、问答题等）来回答问题。
3.  **大模型判题**：AI 会分析你的答案，进行判断，并给出反馈。

整个过程充分利用了平台的**用户互动、输出给 AI、AI 判断、AI 输出**这些核心能力，为你提供即时、个性化的学习效果检验。`;

    const segments = splitContentSegments(raw);
    // console.log("segments", segments);
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("sandbox");
    expect(segments[0].value).toContain(
      '<div style="width: 100%; overflow-x: auto;">'
    );
    expect(segments[0].value).not.toContain(
      "前面内容介绍了如何用 AI 师傅平台进行教学，本小节我们重点介绍如何用 AI 师傅平台进行测评。"
    );
    expect(segments[0].value).not.toContain("在 AI 师傅平台上进行测评");
  });

  it("keeps text segments when enabled (mermaid + text)", () => {
    const raw =
      "```mermaid\ngraph TD\n    subgraph 大语言模型的诞生\n        A[初始模型<br>空白的“大脑”] --> B[预训练<br>海量数据“上学”]\n        B --> C[后训练<br>对齐与微调]\n        C --> D[大语言模型<br>具备语言与知识]\n    end\n```\n\n你有没有想过，为什么一夜之间，好像全世界都在谈论“大模型”？";

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(2);
    expect(segments[0].type).toBe("markdown");
    expect(segments[1].type).toBe("text");
    expect(segments[1].value).toContain(
      "你有没有想过，为什么一夜之间，好像全世界都在谈论“大模型”？"
    );
  });

  it("keeps text segments when enabled (html + text)", () => {
    const raw = ["Intro", "<div><p>real html</p></div>", "Outro"].join("\n");

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("text");
    expect(segments[1].type).toBe("sandbox");
    expect(segments[2].type).toBe("text");
    expect(segments[2].value).toContain("Outro");
  });

  it("treats iframe video blocks as markdown segments", () => {
    const raw =
      "Intro\n\n<iframe data-tag='video' src=\"https://example.com/video\"></iframe>\n\nOutro";

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("text");
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain("data-tag='video'");
    expect(segments[2].type).toBe("text");
  });

  it("splits leading text, svg, and trailing text when keepText is true", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

<svg width="100%" height="200" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F63EE;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#0F63EE;stop-opacity:0.05" />
    </linearGradient>
    <clipPath id="avatarClip">
      <circle cx="100" cy="100" r="40"/>
    </clipPath>
  </defs>
  <rect width="800" height="200" fill="url(#bgGrad)" rx="10"/>
  <rect x="20" y="20" width="760" height="160" fill="white" fill-opacity="0.9" rx="8" stroke="#0F63EE" stroke-width="2"/>
  <image href="https://resource.ai-shifu.com/ac186b833d0e417fb02737910b3a5ae0" x="60" y="60" height="80" width="80" clip-path="url(#avatarClip)"/>
  <line x1="160" y1="100" x2="180" y2="100" stroke="#0F63EE" stroke-width="3"/>
  <rect x="200" y="70" width="400" height="60" fill="none" stroke="#0F63EE" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="400" y="105" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#0F63EE" font-weight="bold">跟 AI 学 AI 通识</text>
  <text x="400" y="135" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#666">大模型 · 应用 · 思维</text>
  <rect x="650" y="150" width="120" height="30" rx="15" fill="#0F63EE"/>
  <text x="710" y="170" text-anchor="middle" font-family="sans-serif" font-size="14" fill="white">一对一课堂</text>
</svg>

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("text");
    expect(segments[0].value).toBe(
      "你好，我是孙志岗，初次见面，很高兴认识你。\n\n"
    );
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain("<svg");
    expect(segments[1].value).toContain("</svg>");
    expect(segments[2].type).toBe("text");
    expect(segments[2].value).toContain("为了判断咱们这门课是否真的适合你");
    expect(segments[2].value).toContain("AI 是一种工具");
  });

  it("splits leading text, svg, and trailing text when keepText is false", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

<svg width="100%" height="200" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F63EE;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#0F63EE;stop-opacity:0.05" />
    </linearGradient>
    <clipPath id="avatarClip">
      <circle cx="100" cy="100" r="40"/>
    </clipPath>
  </defs>
  <rect width="800" height="200" fill="url(#bgGrad)" rx="10"/>
  <rect x="20" y="20" width="760" height="160" fill="white" fill-opacity="0.9" rx="8" stroke="#0F63EE" stroke-width="2"/>
  <image href="https://resource.ai-shifu.com/ac186b833d0e417fb02737910b3a5ae0" x="60" y="60" height="80" width="80" clip-path="url(#avatarClip)"/>
  <line x1="160" y1="100" x2="180" y2="100" stroke="#0F63EE" stroke-width="3"/>
  <rect x="200" y="70" width="400" height="60" fill="none" stroke="#0F63EE" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="400" y="105" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#0F63EE" font-weight="bold">跟 AI 学 AI 通识</text>
  <text x="400" y="135" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#666">大模型 · 应用 · 思维</text>
  <rect x="650" y="150" width="120" height="30" rx="15" fill="#0F63EE"/>
  <text x="710" y="170" text-anchor="middle" font-family="sans-serif" font-size="14" fill="white">一对一课堂</text>
</svg>

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw);

    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("<svg");
    expect(segments[0].value).toContain("</svg>");
    expect(segments[0].value).not.toContain(
      "为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？"
    );
  });

  //   it("splits text and partial mermaid fenced block when keepText is true", () => {
  //     const raw = `简单说，AI 的发展历程可以浓缩为四个阶段：

  // \`\`\`mermaid
  // timeline
  //     title AI 发展四阶段
  //     section 第一阶段
  //         穷举法
  //     : 基于规则与计算`;
  //     // console.log('splits text and partial mermaid fenced block when keepText is true', splitContentSegments(raw, true));
  //     const segments = splitContentSegments(raw, true);
  //     expect(segments).toHaveLength(2);
  //     expect(segments[0].type).toBe("text");
  //     expect(segments[0].value).toBe("简单说，AI 的发展历程可以浓缩为四个阶段：");
  //     expect(segments[1].type).toBe("markdown");
  //     expect(segments[1].value).toContain("```mermaid");
  //     expect(segments[1].value).toContain("timeline");
  //   });

  //   it("splits text and partial mermaid fenced block when keepText is false", () => {
  //     const raw = `简单说，AI 的发展历程可以浓缩为四个阶段：

  // \`\`\`mermaid
  // timeline
  //     title AI 发展四阶段
  //     section 第一阶段
  //         穷举法
  //     : 基于规则与计算`;
  //     // console.log('splits text and partial mermaid fenced block when keepText is false', splitContentSegments(raw));
  //     const segments = splitContentSegments(raw);
  //     expect(segments).toHaveLength(1);
  //     expect(segments[0].type).toBe("markdown");
  //     expect(segments[0].value).toContain("```mermaid");
  //     expect(segments[0].value).toContain("timeline");
  //     expect(segments[0].value).not.toContain("的发展历程可以浓缩为四个阶段：");

  //   });

  it("splits leading text, img, and trailing text when keepText is true", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

<img src="https://resource.ai-shifu.com/ac186b833d0e417fb02737910b3a5ae0" alt="avatar" width="120" height="120" />

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("text");
    expect(segments[0].value).toBe(
      "你好，我是孙志岗，初次见面，很高兴认识你。\n\n"
    );
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain("<img");
    expect(segments[2].type).toBe("text");
    expect(segments[2].value).toContain("为了判断咱们这门课是否真的适合你");
    expect(segments[2].value).toContain("AI 是一种工具");
  });

  it("splits markdown image when keepText is true", () => {
    const raw =
      "你好,一起来看个图吧\n\n![Weixin Image_20260105141453_56_4264.png](https://resource.ai-shifu.cn/78f3374ba65a4334b9b40e4fee7b82f9)";

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(2);
    expect(segments[0]).toEqual({
      type: "text",
      value: "你好,一起来看个图吧\n\n",
    });
    expect(segments[1]).toEqual({
      type: "markdown",
      value:
        "![Weixin Image_20260105141453_56_4264.png](https://resource.ai-shifu.cn/78f3374ba65a4334b9b40e4fee7b82f9)",
    });
  });

  it("splits leading text, img, and trailing text when keepText is false", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

<img src="https://resource.ai-shifu.com/ac186b833d0e417fb02737910b3a5ae0" alt="avatar" width="120" height="120" />

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw);

    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("<img");
    expect(segments[0].value).not.toContain(
      "为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？"
    );
  });

  it("splits leading text, mermaid, and trailing text when keepText is true", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

\`\`\`mermaid
graph TD
    A[hello] --> B[world]
\`\`\`

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("text");
    expect(segments[0].value).toBe(
      "你好，我是孙志岗，初次见面，很高兴认识你。\n\n"
    );
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain("```mermaid");
    expect(segments[2].type).toBe("text");
    expect(segments[2].value).toContain("为了判断咱们这门课是否真的适合你");
    expect(segments[2].value).toContain("AI 是一种工具");
  });

  it("splits leading text, mermaid, and trailing text when keepText is false", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

\`\`\`mermaid
graph TD
    A[hello] --> B[world]
\`\`\`

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw);

    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("```mermaid");
    expect(segments[0].value).not.toContain(
      "为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？"
    );
  });

  it("splits leading text, table, and trailing text when keepText is true", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw, true);
    // console.log('splits leading text, table, and trailing text when keepText is true', segments);
    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("text");
    expect(segments[0].value).toBe(
      "你好，我是孙志岗，初次见面，很高兴认识你。\n\n"
    );
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toBe(`| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`);
    expect(segments[2].type).toBe("text");
    expect(segments[2].value).toBe(
      "\n\n为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？\n\n1.  AI 是一种工具\n2.  每种 AI 产品都需要学习使用方法\n3.  打造 AI 产品是技术高手的事情"
    );
  });

  it("splits leading text, table, and trailing text when keepText is false", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw);
    // console.log('splits leading text, table, and trailing text when keepText is true', segments);
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toBe(`| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`);
    expect(segments[0].value).not.toContain(
      "你好，我是孙志岗，初次见面，很高兴认识你。"
    );
    expect(segments[0].value).not.toContain(
      "为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？"
    );
  });

  it("treats streamed svg plus trailing text as markdown", () => {
    const raw =
      '这门课，核心就是讲如何调教 AI 的，目标是帮你成为 AI 的主人。而且，调教的思路非常符合人的直觉，最核心的只需要理解三件事：<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#f5f5f5"/></svg>不是一个技术名词，而是一种工作方式：不追求完全理解每一行代码，更关注“整体是否跑通”“功能是否达成';

    const segments = splitContentSegments(raw);
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("<svg");
    expect(segments[0].value).not.toContain(
      "这门课，核心就是讲如何调教 AI 的，目标是帮你成为 AI 的主人。而且，调教的思路非常符合人的直觉，最核心的只需要理解三件事："
    );
    expect(segments[0].value).not.toContain(
      "不追求完全理解每一行代码，更关注“整体是否跑通”“功能是否达成"
    );
  });

  it("keeps streamed svg as a single markdown block when keepText is true", () => {
    const raw =
      '这门课，核心就是讲如何调教 AI 的，目标是帮你成为 AI 的主人。而且，调教的思路非常符合人的直觉，最核心的只需要理解三件事：<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#f5';

    const segments = splitContentSegments(raw, true);

    // console.log('keeps streamed svg as a single markdown block when keepText is true', segments);
    expect(segments).toHaveLength(2);
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain("</svg>");
  });

  it("keeps streamed svg as a single markdown block when keepText is false", () => {
    const raw =
      '这门课，核心就是讲如何调教 AI 的，目标是帮你成为 AI 的主人。而且，调教的思路非常符合人的直觉，最核心的只需要理解三件事：<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#f5';

    const segments = splitContentSegments(raw);

    // console.log('keeps streamed svg as a single markdown block when keepText is true', segments);
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("</svg>");
    expect(segments[0].value).not.toContain(
      "这门课，核心就是讲如何调教 AI 的，目标是帮你成为 AI 的主人。而且，调教的思路非常符合人的直觉，最核心的只需要理解三件事："
    );
  });

  it("keeps long fenced code block as single markdown segment when keepText is true", () => {
    const raw =
      "```c\n  int a[N][N] = {\n      {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},\n      {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},\n      {1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1},\n      {1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1},\n      {1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, ";

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("```c");
  });

  // it("keeps long fenced code block as single markdown segment when keepText is false", () => {
  //   const raw = "```c\n  int a[N][N] = {\n      {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},\n      {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},\n      {1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1},\n      {1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1},\n      {1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, ";

  //   const segments = splitContentSegments(raw);

  //   expect(segments).toHaveLength(1);
  //   expect(segments[0].type).toBe("markdown");
  //   expect(segments[0].value).toContain("```c");
  // });

  it("keeps markdown table as markdown segment", () => {
    const raw = `## Tables
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`;

    const segments = splitContentSegments(raw, true);
    expect(segments).toHaveLength(2);
    expect(segments[0].type).toBe("text");
    expect(segments[0].value).toContain("Tables");
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain("Header 1");

    const segments2 = splitContentSegments(raw);
    expect(segments2).toHaveLength(1);
    expect(segments2[0].type).toBe("markdown");
    expect(segments2[0].value).toContain("Header 1");
  });
});
