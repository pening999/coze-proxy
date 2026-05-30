# 平遥古城智能文旅平台

> **AI 导览平遥古城，让千年晋商文化可问、可游、可创作。**
>
> 面向游客、研学用户与文旅传播者的 AI 数字导览与文化共创平台。
>
> 🏆 AI Web 网页开发挑战赛参赛作品 | [线上访问](https://pygcwhgc.site/) | 测试账号：test / 123456

---

## 📋 项目定位

本项目基于平遥古城丰富的文化遗产资源，构建融合 **AI 问答、个性化游线推荐、VR 沉浸式体验与文化内容共创** 的智能文旅 Web 应用。

从静态展示升级为 AI 驱动的交互式文化体验闭环：

```
游前：了解平遥 → 生成路线 → 收藏计划
游中：VR 探索 → AI 讲解 → 动态调整
游后：生成游记 → 保存分享 → 文化传播
```

---

## 🗂️ 项目结构

```
 ├── 首页.html               # 首页（AI 导览入口 + 核心功能卡片 + 运营展示）
 ├── history.html            # 历史与文化（时间轴 + AI 讲解入口）
 ├── architecture.html       # 建筑特色（古建画廊 + 筛选卡片）
 ├── vr.html                 # VR 全景体验（场景说明 + AI 讲解 + 全屏）
 ├── creation.html           # 文化共创空间（AI 绘图 + 文案改写 + 灵感推荐）
 ├── login.html              # 用户登录/注册
 ├── usercenter.html         # 用户中心（路线/创作/收藏/偏好设置/Token配置）
 ├── 1.html ~ 9.html         # 各景点详情子页面
 ├── manifest.json           # 🔥 PWA 清单（可安装 APP）
 ├── service-worker.js       # 🔥 PWA 离线缓存 + 资源预加载
 │
 ├── CSS/
 │   └── PYGCCSS.css         # 全局样式 + 骨架屏 + 滚动动画 + PWA安装提示 + 降级横幅
 ├── JS/
 │   ├── components/
 │   │   ├── nav.js          # 全局导航栏（自适应 + 搜索入口 + 移动端汉堡菜单）
 │   │   ├── searchOverlay.js # 🔥 全站搜索（Ctrl+K，景点/美食/文化一键搜）
 │   │   ├── skeletonLoader.js # 🔥 骨架屏加载组件（text/card/route/list 四种模板）
 │   │   ├── scrollReveal.js  # 🔥 滚动渐入动画（IntersectionObserver）
 │   │   ├── backToTop.js     # 🔥 回到顶部按钮（平滑滚动）
 │   │   └── aiTip.js         # 首页 AI 助手欢迎提示浮层
 │   ├── modules/
 │   │   ├── routePlanner.js  # 路线规划模块（表单→AI→结果→保存）
 │   │   └── userCenter.js    # 用户中心模块（登录/注册/个人管理）
 │   ├── api/
 │   │   ├── cozeClient.js    # 🔥 Coze API 统一封装（网络检测+重试+降级+流式）
 │   │   └── index.js         # API 模块导出
 │   ├── utils/
 │   │   ├── storage.js       # localStorage 存储工具（用户偏好/路线/创作/收藏）
 │   │   ├── errorHandler.js  # 🔥 统一错误处理 + Toast + 加载态 + 重试机制
 │   │   ├── validators.js    # 表单校验
 │   │   └── lazyLoad.js      # 图片懒加载（IntersectionObserver + 淡入）
 │   └── PYGCJS.js            # 全局轮播图 + 通用初始化
 │
 ├── data/
 │   ├── pingyaoSpots.json    # 平遥景点知识库（14景点+美食+特产）
 │   └── cultureKnowledge.json # 平遥文化知识库（历史+文化+常见问题）
 ├── IMG/                     # 图片资源
 ├── config.js                # 🔥 全局配置（降级策略+加载状态+网络检测）
 ├── .env.example             # 环境变量模板
 ├── vercel.json              # Vercel 部署配置（安全头 + PWA 头）
 └── README.md                # 本文档
```

### 1️⃣创新点

| 创新点 | 说明 |
|--------|------|
| **知识型 AI 导览** | 围绕平遥古城历史、晋商文化、建筑特色、票号知识做定向问答，而非通用 Bot |
| **个性化游线生成** | 用户输入游玩时长、兴趣偏好、同行人群、预算、体力，AI 生成半日/一日/两日路线卡片 |
| **VR+AI 联动讲解** | 在全景场景中点击"AI 讲解当前场景"，获得历史文化背景讲解 |
| **文化共创工具链** | 意境绘卷、风格化文案改写、旅游灵感推荐，形成从获取信息到生成内容的闭环 |
| **全站智能搜索** | 🔥 Ctrl+K 触发全局搜索，景点/美食/文化一搜即达，拼音模糊匹配+高亮 |
| **AI 服务降级** | 🔥 网络异常时自动切换离线演示模式，保障核心功能可用 |

### 2️⃣ 用户体验设计

- **5 秒价值传达**：首页首屏轮播图 + Slogan + AI 导览/路线/VR 三大 CTA 入口 + 使用流程三步引导
- **骨架屏加载**：🔥 AI 请求时显示专业骨架屏动画（文本/卡片/路线/列表四种模板），替代传统转圈
- **滚动渐入动画**：🔥 页面元素随滚动逐帧淡入，提升浏览节奏感
- **全站搜索**：🔥 Ctrl+K 快捷键搜索，实时模糊匹配，结果高亮 + 分类分组
- **回到顶部**：🔥 长页面一键回顶，平滑滚动
- **PWA 安装提示**：🔥 桌面/手机可安装 APP，沉浸式全屏体验
- **任务驱动设计**：围绕"游前了解→游中体验→游后创作"三条主线组织页面结构
- **全流程闭环**：生成路线 → 保存到我的路线 → 在用户中心查看管理；AI 作答 → 复制/保存
- **响应式适配**：桌面/平板/手机三断点适配，移动端汉堡菜单、卡片单列布局
- **视觉统一**：古城红色主题 (#8c1515) + 米色背景 (#f8f5f0) + SimSun 宋体 + 古典纹理风格
- **加载遮罩**：🔥 页面加载时显示"平遥古韵 · 徐徐展开"过渡动画
- **Toast 通知**：🔥 统一的消息提示系统（成功/警告/错误/信息），优雅替代 alert
- **服务降级提示**：🔥 网络异常时自动显示降级横幅，透明告知用户状态

### 3️⃣ 技术实现

| 技术维度 | 实现方式 |
|----------|----------|
| **模块化架构** | JS 按 api / modules / utils / components 分目录，职责清晰，命名规范 |
| **API 统一封装** | 🔥 `CozeClient` 单例封装所有 Coze 请求，支持流式/非流式/SSE、自动降级、重试机制 |
| **错误处理三件套** | 🔥 `ErrorHandler.wrapApiCall()` 统一管理 loading/error/fallback/retry，Toast 通知 |
| **骨架屏组件** | 🔥 四种模板（text/card/route/list），CSS skeleton-wave 动画，3秒超时 fallback |
| **全站搜索引擎** | 🔥 `SiteSearch` 客户端搜索，数据融合景点/美食/特产/历史，分组+高亮+键盘导航 |
| **PWA 离线支持** | 🔥 Service Worker 缓存策略（静态缓存优先、HTML 网络优先），安装提示，manifest 清单 |
| **用户数据持久化** | 🔥 `StorageUtils` 封装 localStorage，支持用户偏好、路线记录、创作历史、收藏管理 |
| **图片懒加载** | 🔥 `lazyLoad.js` 基于 IntersectionObserver，提前 200px 加载，淡入过渡 |
| **API 安全** | 🔥 Token 仅从 localStorage 读取，config.js 仅存默认演示值，生产环境通过 Vercel 环境变量注入 |
| **AI 降级策略** | 🔥 网络不可用时自动切换离线 mock 数据，页面显示降级提示横幅，指数退避重试 |
| **滚动动画** | 🔥 `scrollReveal.js` 基于 IntersectionObserver，逐元素延迟触发的渐入动画 |
| **响应式实现** | 🔥 CSS 媒体查询三断点 + 移动端汉堡菜单 + 弹性布局网格 |
| **SEO 优化** | 🔥 全站 Open Graph + Description + Keywords meta 标签 |
| **全局状态管理** | 🔥 CozeClient 单例维护网络状态、降级模式、Token 等全局状态 |
| **网络监控** | 🔥 每5秒自动检测网络状态，连续3次失败触发降级 |

**已上线部署**：Vercel + 自定义域名 `https://pygcwhgc.site/`

### 4️⃣ 商业价值与可行性

| 用户画像 | 价值 |
|----------|------|
| 🧑‍🤝‍🧑 **C 端游客** | 免费获取个性化路线、AI 讲解、VR 预览，降低旅行规划成本 |
| 🏫 **研学用户** | 获取系统化的平遥文化知识、AI 导览讲解词、研学路线方案 |
| 📝 **文旅传播者** | 使用 AI 生成小红书文案、游记、短视频脚本，提升内容创作效率 |
| 🏛️ **景区/文旅机构** | 可扩展为景区官方导览平台，支持嵌入公众号/小程序 |
| 🔥 **PWA 可安装** | 🔥 用户可将平台安装到手机桌面，像原生 APP 一样使用，提升用户粘性 |

### 5️⃣ 上线运营能力

- ✅ **已上线 Vercel**，域名可公开访问（https://pygcwhgc.site/）
- ✅ **提供测试账号** (test / 123456)
- ✅ **用户反馈表单**（首页底部含表情评分 + 文字反馈，自动存入 localStorage）
- ✅ **`.env.example`** 提供部署环境配置模板
- ✅ **`vercel.json`** 含 SPA 路由重写 + 安全头 + PWA 头配置
- ✅ **静态资源路径相对化**，可一键迁移到任意托管平台
- ✅ **PWA 特性** 🔥 支持离线访问、可安装 APP、全屏沉浸
- ✅ **SEO 优化** 🔥 全站 OG 标签 + 关键词 + description，搜索引擎友好
- ✅ **骨架屏首屏** 🔥 用户感知加载速度快，减少白屏等待焦虑
- ✅ **AI 降级机制** 🔥 服务不可用时自动切换离线模式，保障基本可用性
- ✅ **网络状态监控** 🔥 自动检测网络，连续失败自动降级
- ✅ **Toast 通知系统** 🔥 统一优雅的消息提示，替代原生 alert
- ✅ **全局异常捕获** 🔥 捕获 JS 错误和未处理 Promise，避免页面崩溃

---

## 🚀 本地运行

```bash
# 方式一：直接双击打开 首页.html
# 方式二：Python 内置服务器
python -m http.server 8000

# 方式三：Node.js
npx serve .
```

## ☁️ Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. 将仓库导入 Vercel
2. 框架预设选 **Other**
3. 部署即可，`vercel.json` 已配置 `/` → `/首页.html` 路由重写 + 安全头 + PWA 头

## 🔑 配置 Coze API Token

1. 前往 [Coze 平台](https://www.coze.cn) 获取 Bot ID 和 Token
2. **方式一（推荐）**：在个人中心 → 偏好设置 → Coze API Token 中直接粘贴保存（保存到 localStorage）
3. **方式二**：浏览器控制台执行 `localStorage.setItem('pingyao_coze_token', '你的令牌')`
4. **方式三（生产环境）**：在 Vercel 项目设置中配置环境变量 `PINGYAO_COZE_TOKEN`

> ⚠️ **安全提醒**：不要将真实 Token 硬编码在前端代码中！生产环境务必通过 Vercel Environment Variables 注入。

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端 | HTML5 + CSS3 + JavaScript (原生) |
| AI 引擎 | Coze Bot API + Coze SDK |
| VR 全景 | 720yun 嵌入 |
| 文档渲染 | marked.js + highlight.js |
| 图标库 | Font Awesome 6 |
| 字体 | SimSun / 宋体 |
| PWA | 🔥 Service Worker + Web App Manifest |
| 动画 | 🔥 IntersectionObserver（滚动渐入 + 懒加载） |
| 部署托管 | Vercel |
| 错误处理 | 🔥 统一 ErrorHandler + Toast + 重试机制 |
| API 封装 | 🔥 CozeClient 单例 + 降级 + 重试 + 流式 |

---

## ⚠️ 安全说明

- ❌ 不要在 `config.js` 中写入真实 Token
- ✅ 真实 Token 通过个人中心设置页 或 `localStorage.setItem()` 设置
- ✅ 生产环境建议通过 Vercel Serverless Function 转发 Coze 请求
- ✅ `.env.example` 仅作为配置模板
- ✅ 所有网络请求通过 `ErrorHandler.wrapApiCall` 包装，统一处理异常

