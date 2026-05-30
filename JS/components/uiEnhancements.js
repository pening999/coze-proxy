/**
 * uiEnhancements.js - UI/UX 交互增强
 * 功能：滚动进度条、Hero 视差效果、图片模糊渐入加载、AI 打字动画工具
 * 自动注入，无需额外配置
 */
(function () {
  'use strict';

  // ============================================================
  // 1. 滚动进度条
  // ============================================================
  (function scrollProgressBar() {
    var bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollTop = window.scrollY;
          var docHeight = document.documentElement.scrollHeight - window.innerHeight;
          var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          bar.style.width = Math.min(progress, 100) + '%';
          ticking = false;
        });
        ticking = true;
      }
    });
  })();

  // ============================================================
  // 2. Hero 视差效果（滚动时背景微移）
  // ============================================================
  (function heroParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    hero.classList.add('parallax');

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollY = window.scrollY;
          if (scrollY < window.innerHeight) {
            var items = hero.querySelectorAll('.carousel-item.active');
            items.forEach(function (item) {
              var speed = 0.3;
              item.style.backgroundPosition = '50% ' + (scrollY * speed) + 'px';
            });
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  })();

  // ============================================================
  // 3. 图片模糊渐入加载（data-reveal 属性标记）
  // ============================================================
  (function imageReveal() {
    if (!('IntersectionObserver' in window)) {
      // 降级：直接移除模糊
      document.querySelectorAll('.img-reveal').forEach(function (img) {
        img.classList.add('revealed');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          // 等图片真正加载完成后再移除模糊
          if (img.complete) {
            img.classList.add('revealed');
          } else {
            img.addEventListener('load', function () {
              img.classList.add('revealed');
            });
            img.addEventListener('error', function () {
              img.classList.add('revealed'); // 出错也显示
            });
          }
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px 0px' }); // 提前 200px 加载

    document.querySelectorAll('.img-reveal').forEach(function (img) {
      observer.observe(img);
    });
  })();

  // ============================================================
  // 4. AI 打字动画工具函数（供全局使用）
  // ============================================================
  window.typeText = function (element, text, speed, callback) {
    if (!element) return;
    speed = speed || 25; // 每字符毫秒数

    // 检查文本长度，短文本用快速度，长文本用正常速度
    if (text.length < 50) speed = 15;
    else if (text.length > 500) speed = 8; // 长文本快速输出

    // 空文本直接返回
    if (!text) {
      element.textContent = '';
      if (callback) callback();
      return;
    }

    var index = 0;
    element.textContent = '';
    element.classList.add('ai-typing-cursor');

    function type() {
      if (index < text.length) {
        var char = text.charAt(index);
        // 处理 HTML 特殊字符
        if (char === '<') {
          // 如果是 HTML 标签，直接跳过整段（用于 markdown 渲染结果）
          element.classList.remove('ai-typing-cursor');
          element.innerHTML = text;
          if (callback) callback();
          return;
        }
        element.textContent += char;
        index++;
        // 智能调速：标点符号后稍作停顿
        var delay = speed;
        if (char === '。' || char === '！' || char === '？' || char === '\n') delay = speed * 8;
        else if (char === '，' || char === '、' || char === '；' || char === '：') delay = speed * 3;
        setTimeout(type, delay);
      } else {
        element.classList.remove('ai-typing-cursor');
        if (callback) callback();
      }
    }

    type();
  };

  // ============================================================
  // 5. Toast 增强（自动消失 + 滑动动画）
  // ============================================================
  var _originalToast = window.showToast;
  window.showToast = function (message, duration) {
    duration = duration || 2500;
    var toast = document.getElementById('toast');
    if (!toast) {
      // 动态创建 toast
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.style.cssText = [
        'position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);',
        'background: #333; color: #fff; padding: 12px 24px; border-radius: 8px;',
        'font-size: 14px; z-index: 99999; opacity: 0;',
        'transition: opacity 0.3s ease, transform 0.3s ease;',
        'transform: translateX(-50%) translateY(20px);',
        'pointer-events: none; white-space: nowrap;',
        'box-shadow: 0 4px 20px rgba(0,0,0,0.2);'
      ].join(' ');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    if (window._toastTimer) clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, duration);
  };

  // 保留原始方法
  if (typeof _originalToast === 'function') {
    window._showToastFallback = _originalToast;
  }

})();
