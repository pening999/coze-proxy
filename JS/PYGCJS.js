/**
 * PYGCJS.js - 平遥古城智能文旅平台
 * 
 * 注意：Coze SDK 初始化已在各 HTML 页面中独立配置。
 * 此文件仅包含通用功能和页面基础交互。
 * 
 * 各页面功能已拆分到 js/modules/ 和 js/api/ 目录中。
 */

// 轮播图功能
(function() {
    let slideIndex = 0;
    let slideTimer = null;
    const slides = document.querySelectorAll('.carousel-item');

    if (slides.length === 0) return; // 没有轮播图的页面不执行

    function showSlides() {
        for (let i = 0; i < slides.length; i++) {
            slides[i].classList.remove('active');
        }
        slideIndex++;
        if (slideIndex > slides.length) {
            slideIndex = 1;
        }
        slides[slideIndex - 1].classList.add('active');
        slideTimer = setTimeout(showSlides, 3000);  // 改为3秒
    }

    // 页面加载时启动轮播
    showSlides();

    // 鼠标悬停时暂停轮播
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mouseenter', function() {
            if (slideTimer) clearTimeout(slideTimer);
        });
        hero.addEventListener('mouseleave', function() {
            slideTimer = setTimeout(showSlides, 3000);  // 统一为3秒
        });
    }
})();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 如果页面有 UserCenter，初始化
    if (typeof UserCenter !== 'undefined') {
        UserCenter.init();
    }
});
