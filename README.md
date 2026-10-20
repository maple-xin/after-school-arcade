# 放学后游戏室 / After School Arcade

三个原创、独立运行的静态网页小游戏。无构建步骤、无外部资源请求、无账号或生图服务。

## 游戏

- pinball.html：轨道弹珠台。三个球、发射道、碰撞得分、左右动态挡板、暂停、重开和本地最高分。
- spider.html：单花色蜘蛛纸牌。104 张牌、十列、五次发牌、整组移动、自动收齐、撤销、提示、点击与拖放。
- bubble.html：泡泡龙。墙面反弹、六邻接三消、悬空掉落、换球、五次未消除后增加一排、胜负和本地最高分。
- index.html：游戏选择入口。
- embed.html：真实 iframe 嵌入演示。

## 本地运行

在此目录执行 python3 -m http.server 8765，浏览器打开 http://localhost:8765 。使用 ES Modules，请通过 HTTP 打开，不要直接双击 HTML。

核心规则检查：node tests.mjs 。使用 Node 内置断言，无测试依赖。

## GitHub Pages

把本目录上传到仓库。在 Settings → Pages 选择 Deploy from a branch、main、/(root)。保留 .nojekyll。

上线后，游戏路径分别为：

- https://你的用户名.github.io/仓库名/pinball.html
- https://你的用户名.github.io/仓库名/spider.html
- https://你的用户名.github.io/仓库名/bubble.html

这些是路径格式示例，不代表已经部署。

## Loopit 嵌入

在地址末尾加 ?embed=1，启用紧凑模式：

    <iframe
      src="https://你的用户名.github.io/仓库名/pinball.html?embed=1"
      title="弹珠台"
      style="display:block;width:100%;height:100%;border:0"
      allow="fullscreen"
      allowfullscreen
    ></iframe>

屏幕容器应有真实宽高。房间插画和屏幕容器放在同一个定位父层内，放大整个父层。不要对 iframe 内部游戏另做裁切或二次放大。

小游戏自己根据可用尺寸适配，整张台面始终完整显示。手机上先进入屏幕近景再操作；纸牌在横向较宽的屏幕中更易辨认。

切换 iframe 地址可切换游戏。父页面可通过 postMessage 发送 arcade:pause、arcade:resume、arcade:mute；每个消息对象形如 {type:'arcade:pause'}。游戏只接受直接父窗口发来的这些固定动作，不执行消息中的代码或地址。游戏加载后会向父窗口发送 {type:'arcade:ready',game:'pinball'} 等就绪消息。

嵌入是否被 Loopit 允许，需要在 Loopit 的实际发布环境中验证。

## 操作

弹珠台：空格发球；A/D 或方向键控制挡板；P 暂停。触屏使用对应按钮。

蜘蛛纸牌：点击牌组再点目标列，或直接拖动。K→A 的连续明牌可以成组移动；空列可放任意有效牌组；所有列都有牌时才能发牌。

泡泡龙：移动鼠标或拖动瞄准，松手发射；方向键调整，空格发射，X 换球。触屏也可使用下方按钮。

声音默认关闭，需要玩家主动打开。浏览器存储不可用时仍可继续游戏。
