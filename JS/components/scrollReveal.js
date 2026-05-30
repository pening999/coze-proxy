/**
 * scrollReveal.js - 滚动渐入动画
 * 在元素上添加 class="reveal" 即可启用
 * 可选延迟：reveal-delay-1 ~ reveal-delay-4
 */
(function () {
  'use strict';

  if (!('IntersectionObserver' in window)) {
    // 不支持时直接显示所有
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('revealed');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // 初始观察
  function observeReveal() {
    document.querySelectorAll('.reveal:not(.revealed)').forEach(function (el) {
      observer.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', observeReveal);
  // 动态内容刷新
  window.refreshReveal = observeReveal;
})();
