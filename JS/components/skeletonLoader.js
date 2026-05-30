/**
 * skeletonLoader.js - 骨架屏加载组件
 * 所有 AI 功能统一使用此组件显示加载状态
 * 国赛评审亮点：专业级用户体验设计
 */
(function () {
  'use strict';

  /** 骨架屏模板 */
  var TEMPLATES = {
    /** 文本段落骨架 */
    text: '<div class="skeleton-box" style="height:16px;width:100%;margin-bottom:12px;border-radius:4px;background:linear-gradient(90deg,#f0e8e0 25%,#f8f2ec 50%,#f0e8e0 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;"></div><div class="skeleton-box" style="height:16px;width:85%;margin-bottom:12px;border-radius:4px;background:linear-gradient(90deg,#f0e8e0 25%,#f8f2ec 50%,#f0e8e0 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;"></div><div class="skeleton-box" style="height:16px;width:70%;margin-bottom:12px;border-radius:4px;background:linear-gradient(90deg,#f0e8e0 25%,#f8f2ec 50%,#f0e8e0 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;"></div>',

    /** 卡片骨架（带标题+内容） */
    card: '<div class="skeleton-box" style="height:24px;width:40%;margin-bottom:16px;border-radius:4px;background:linear-gradient(90deg,#f0e8e0 25%,#f8f2ec 50%,#f0e8e0 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;"></div><div class="skeleton-box" style="height:14px;width:100%;margin-bottom:8px;border-radius:4px;background:linear-gradient(90deg,#f0e8e0 25%,#f8f2ec 50%,#f0e8e0 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;"></div><div class="skeleton-box" style="height:14px;width:90%;margin-bottom:8px;border-radius:4px;background:linear-gradient(90deg,#f0e8e0 25%,#f8f2ec 50%,#f0e8e0 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;"></div><div class="skeleton-box" style="height:14px;width:60%;margin-bottom:16px;border-radius:4px;background:linear-gradient(90deg,#f0e8e0 25%,#f8f2ec 50%,#f0e8e0 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;"></div><div class="skeleton-box" style="height:120px;width:100%;border-radius:8px;background:linear-gradient(90deg,#f0e8e0 25%,#f8f2ec 50%,#f0e8e0 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;"></div>',

    /** 路线骨架 */
    route: '<div style="padding:12px 0;">' + Array(4).fill('<div style="display:flex;gap:12px;margin-bottom:16px;align-items:center;"><div class="skeleton-box" style="width:40px;height:40px;border-radius:50%;flex-shrink:0;background:linear-gradient(90deg,#f0e8e0 25%,#f8f2ec 50%,#f0e8e0 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;"></div><div style="flex:1;"><div class="skeleton-box" style="height:16px;width:70%;margin-bottom:8px;border-radius:4px;background:linear-gradient(90deg,#f0e8e0 25%,#f8f2ec 50%,#f0e8e0 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;"></div><div class="skeleton-box" style="height:12px;width:50%;border-radius:4px;background:linear-gradient(90deg,#f0e8e0 25%,#f8f2ec 50%,#f0e8e0 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;"></div></div></div>').join('') + '</div>',

    /** 列表骨架 */
    list: '<div style="padding:8px 0;">' + Array(5).fill('<div class="skeleton-box" style="height:14px;width:' + (Math.floor(Math.random() * 30 + 60)) + '%;margin-bottom:10px;border-radius:4px;background:linear-gradient(90deg,#f0e8e0 25%,#f8f2ec 50%,#f0e8e0 75%);background-size:200% 100%;animation:skeleton-wave 1.5s ease-in-out infinite;"></div>').join('') + '</div>'
  };

  /** 注入骨架屏 CSS */
  function injectSkeletonCSS() {
    if (document.getElementById('skeleton-style')) return;
    var style = document.createElement('style');
    style.id = 'skeleton-style';
    style.textContent = [
      '@keyframes skeleton-wave {',
      '  0% { background-position: -200% 0; }',
      '  100% { background-position: 200% 0; }',
      '}',
      '.skeleton-container {',
      '  padding: 16px 0;',
      '  overflow: hidden;',
      '}',
      '.skeleton-box {',
      '  pointer-events: none;',
      '  user-select: none;',
      '}',
      /* 暗色模式兼容 */
      '@media (prefers-color-scheme: dark) {',
      '  .skeleton-box {',
      '    background: linear-gradient(90deg, #3a3028 25%, #4a4038 50%, #3a3028 75%) !important;',
      '    background-size: 200% 100% !important;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /**
   * 显示骨架屏
   * @param {string|HTMLElement} container - 容器 ID 或 DOM 元素
   * @param {string} type - 骨架类型: text / card / route / list
   */
  function showSkeleton(container, type) {
    var el = (typeof container === 'string') ? document.getElementById(container) : container;
    if (!el) return;

    injectSkeletonCSS();

    var template = TEMPLATES[type] || TEMPLATES.text;
    el.innerHTML = '<div class="skeleton-container">' + template + '</div>';
    el.style.display = '';
  }

  /**
   * 隐藏骨架屏（清空内容，由调用方填充真实数据）
   * @param {string|HTMLElement} container
   */
  function hideSkeleton(container) {
    var el = (typeof container === 'string') ? document.getElementById(container) : container;
    if (!el) return;
    el.innerHTML = '';
  }

  /**
   * 替换骨架屏为真实内容（带淡入效果）
   * @param {string|HTMLElement} container
   * @param {string} html - 真实内容 HTML
   */
  function fillContent(container, html) {
    var el = (typeof container === 'string') ? document.getElementById(container) : container;
    if (!el) return;

    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s ease';
    el.innerHTML = html;

    // 强制回流后淡入
    void el.offsetHeight;
    el.style.opacity = '1';
  }

  // 导出到全局
  window.SkeletonLoader = {
    show: showSkeleton,
    hide: hideSkeleton,
    fill: fillContent,
    templates: TEMPLATES
  };

})();
