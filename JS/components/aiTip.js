/**
 * aiTip.js - 平遥古城 AI 助手欢迎提示浮层
 * 仅在首页右下角显示，融入古风设计，可关闭
 */
(function () {
  'use strict';

  // 仅在首页显示（兼容本地 file:// 协议，中文路径会被 URL 编码）
  var path = decodeURIComponent(window.location.pathname.split('/').pop() || '');
  if (path !== '首页.html' && path !== 'index.html') return;

  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAITip);
  } else {
    initAITip();
  }

  function initAITip() {
    // 若已加载过，不再重复创建
    if (document.getElementById('ai-assistant-tip')) return;

    var brand = '#8c1515';

    // 创建提示浮层
    var tip = document.createElement('div');
    tip.id = 'ai-assistant-tip';
    tip.style.cssText = [
      'position: fixed',
      'bottom: 100px',
      'right: 30px',
      'z-index: 9998',
      'background: #fffcf9',
      'border: 1px solid #dfcfbe',
      'border-left: 3px solid ' + brand,
      'border-radius: 10px',
      'padding: 13px 16px 11px',
      'max-width: 250px',
      'box-shadow: 0 2px 10px rgba(0,0,0,0.04)',
      'font-family: "Microsoft YaHei", "PingFang SC", sans-serif',
      'animation: aiTipIn 0.7s ease-out',
      'transition: opacity 0.35s, transform 0.35s',
      'transform-origin: bottom right',
      'cursor: default',
      'line-height: 1.5',
      'color: #4a4038'
    ].join(';') + ';';

    tip.innerHTML = [
      '<div style="display:flex;align-items:center;gap:10px;">',
      '  <div style="flex-shrink:0;width:28px;height:28px;background:' + brand + ';border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;color:#fffcf9;">',
      '    <i class="fa-solid fa-robot"></i>',
      '  </div>',
      '  <div style="flex:1;min-width:0;">',
      '    <div style="font-size:13px;font-weight:600;color:#3a2a1a;">平遥 AI 导览</div>',
      '    <div style="margin-top:2px;font-size:12px;color:#7a6a5a;">点击气泡，聊聊古城故事</div>',
      '  </div>',
      '  <div style="flex-shrink:0;">',
      '    <button id="ai-tip-gotit" style="background:' + brand + ';color:#fff;border:none;border-radius:4px;padding:3px 10px;font-size:11px;cursor:pointer;line-height:1.6;letter-spacing:0.5px;opacity:0.85;">好的</button>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(tip);

    var styleEl = document.createElement('style');
    styleEl.textContent = [
      '@keyframes aiTipIn {',
      '  from { opacity: 0; transform: translateY(8px); }',
      '  to { opacity: 1; transform: translateY(0); }',
      '}',
      '#ai-tip-gotit:hover { opacity: 1 !important; }'
    ].join('\n');
    document.head.appendChild(styleEl);

    document.getElementById('ai-tip-gotit').addEventListener('click', function () {
      dismissTip();
    });

    function dismissTip() {
      tip.style.opacity = '0';
      tip.style.transform = 'translateY(6px)';
      setTimeout(function () {
        tip.style.display = 'none';
      }, 350);
    }

    var checkCoze = setInterval(function () {
      var iframe = document.querySelector('iframe[src*="coze"]');
      if (iframe && iframe.offsetParent !== null) {
        clearInterval(checkCoze);
        dismissTip();
      }
    }, 1500);
  }
})();
