/**
 * 图片懒加载模块
 * 使用 IntersectionObserver 实现图片延迟加载
 * 用法：<img data-src="真实图片URL" class="lazy-img" src="占位图或空" alt="...">
 */
(function() {
  'use strict';

  // 检查浏览器是否支持 IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    // 不支持时直接加载所有图片
    document.querySelectorAll('img[data-src]').forEach(function(img) {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    });
    return;
  }

  var lazyObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var img = entry.target;
        var src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.add('lazy-loaded');
        }
        lazyObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '200px 0px', // 提前200px加载
    threshold: 0.01
  });

  // 监听所有带有 data-src 的图片
  function observeLazyImages() {
    document.querySelectorAll('img[data-src]').forEach(function(img) {
      // 加载完成前添加淡入效果类
      img.classList.add('lazy-img');
      lazyObserver.observe(img);
    });
  }

  // 初始观察
  document.addEventListener('DOMContentLoaded', observeLazyImages);

  // 暴露刷新函数，用于动态添加的图片
  window.refreshLazyImages = observeLazyImages;
})();
