/**
 * 平遥古城智能文旅平台 - 全局配置文件
 * 修改此文件中的配置项即可同步所有页面
 * 
 * Pingyao Ancient City Cultural Tourism Platform - Global Config
 */
(function () {
  // ====== 安全提示 ======
  // 生产环境请通过 Vercel Environment Variables 注入 API Token，
  // 前端代码中不得硬编码真实 Token！
  //
  // 本地开发时，通过 localStorage 临时设置（仅用于本地调试）：
  //   localStorage.setItem('pingyao_coze_token', '你的_token')
  //
  // 部署到 Vercel 后，在项目设置 → Environment Variables 中配置。

  // 从 localStorage 读取令牌（仅用于开发调试）
  var savedToken = '';
  try {
    savedToken = localStorage.getItem('pingyao_coze_token') || '';
  } catch (e) { /* ignore */ }

  // 不设置默认 Token，确保生产环境必须通过环境变量注入
  // 用户首次使用需自行配置 Token（参见 .env.example 和 README）

  window.PINGYAO_CONFIG = {
    // Coze AI 智能助手配置
    coze: {
      botId: '7628618640471965731',
      token: savedToken,
      // CDN 地址
      cdn: 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/index.js'
    },

    // 智能助手 UI 配置
    assistant: {
      title: '平遥古城智能助手',
      icon: 'https://img.icons8.com/color/48/000000/pagoda.png',
      position: { top: '85px', right: '20px', bottom: 'auto' }
    },

    // API 降级配置
    fallback: {
      enabled: true,
      announcement: '⚠️ 当前 API 服务不可用，已切换至离线演示模式，部分回答为预设数据。',
      maxRetries: 3,
      retryDelay: 1000, // 毫秒
      mockDataDelay: 1500 // 模拟网络延迟
    },

    // 加载状态 UI 配置
    loading: {
      showOverlay: true,
      overlayText: '平遥古韵 · 徐徐展开',
      skeletonTimeout: 3000 // 骨架屏超时时间（ms）
    },

    // 全局网络状态检测配置
    network: {
      checkInterval: 5000, // 每5秒检测一次网络
      offlineThreshold: 3 // 连续3次检测失败才标记离线
    }
  };
})();
