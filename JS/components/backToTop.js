/**
 * backToTop.js - 回到顶部按钮
 * 滚动超过 400px 时显示，支持平滑滚动
 */
(function () {
  'use strict';

  // 注入 CSS
  var style = document.createElement('style');
  style.textContent = [
    '#back-to-top {',
    '  position: fixed; bottom: 40px; left: 30px;',
    '  z-index: 9995; width: 44px; height: 44px;',
    '  background: #8c1515; color: #fffcf9; border: none;',
    '  border-radius: 50%; cursor: pointer;',
    '  display: none; align-items: center; justify-content: center;',
    '  font-size: 18px; box-shadow: 0 2px 12px rgba(140,21,21,0.3);',
    '  transition: all 0.3s ease; opacity: 0;',
    '  pointer-events: none;',
    '}',
    '#back-to-top.visible {',
    '  display: flex; opacity: 1; pointer-events: auto;',
    '}',
    '#back-to-top:hover {',
    '  background: #a02020; transform: translateY(-2px);',
    '  box-shadow: 0 4px 16px rgba(140,21,21,0.4);',
    '}',
    '#back-to-top:active { transform: translateY(0); }',
    '@media (max-width: 600px) {',
    '  #back-to-top { bottom: 24px; left: 16px; width: 38px; height: 38px; font-size: 15px; }',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // 创建按钮
  var btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', '回到顶部');
  btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  document.body.appendChild(btn);

  // 滚动监听
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        if (window.scrollY > 400) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  // 点击回到顶部
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();
