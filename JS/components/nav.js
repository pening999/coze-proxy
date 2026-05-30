/**
 * global-nav.js - 全局导航栏组件
 * 所有页面统一导航栏，自动高亮当前页面
 * 使用方式：在 body 中放置 <div id="global-nav"></div> ，在 </body> 前引入此脚本
 */
(function () {
  'use strict';

  // ---- 配置 ----
  var currentPage = window.location.pathname.split('/').pop() || '首页.html';

  var menuItems = [
    { label: '首页', href: '首页.html' },
    { label: '历史与文化', href: 'history.html' },
    { label: '建筑特色', href: 'architecture.html' },
    { label: 'VR体验', href: 'vr.html' },
    { label: '文化共创', href: 'creation.html' },
    { label: '旅游服务', href: 'https://pingyao888.cn' }
  ];

  // ---- 构建导航 HTML ----
  var html = '';
  html += '<header>';
  html += '<div class="container">';
  html += '<nav>';
  html += '<a href="首页.html" class="logo">平遥古城</a>';
  html += '<ul class="nav-links">';

  // 主菜单项
  for (var i = 0; i < menuItems.length; i++) {
    var item = menuItems[i];
    var activeStyle = (currentPage === item.href) ? ' style="color:#e8c6a6;"' : '';
    html += '<li><a href="' + item.href + '"' + activeStyle + '>' + item.label + '</a></li>';
  }

  // ---- 读取用户登录状态（直接读 localStorage，不依赖其他模块） ----
  var userData = null;
  try {
    var raw = localStorage.getItem('pingyao_user_profile');
    if (raw) {
      userData = JSON.parse(raw);
    }
  } catch (e) { /* 忽略解析错误 */ }
  var isLoggedIn = userData && userData.isLoggedIn === true;

  // 用户中心链接（图标 + 文字）
  var userActive = (currentPage === 'usercenter.html') ? ' style="color:#e8c6a6;"' : '';
  html += '<li><a href="usercenter.html"' + userActive + '><i class="fa-regular fa-user"></i> 个人中心</a></li>';

  // 搜索按钮（Ctrl+K 触发）
  html += '<li><a href="#" onclick="event.preventDefault();if(window.SiteSearch)SiteSearch.open();" title="搜索 (Ctrl+K)" class="nav-search-btn"><i class="fa-solid fa-search"></i></a></li>';

  if (isLoggedIn) {
    // 已登录：显示用户名（指向个人中心），加"退出"按钮
    var username = userData.username || '用户';
    html += '<li><a href="usercenter.html" class="logged-in-username">' + username + '</a></li>';
    html += '<li><a href="#" class="nav-logout-btn" style="color:#c0392b;" id="nav-logout-btn">退出</a></li>';
  } else {
    // 未登录：显示"登录"
    html += '<li><a href="login.html">登录</a></li>';
  }

  html += '</ul>';
  html += '</nav>';

  // ---- 移动端汉堡菜单按钮 ----
  html += '<button class="hamburger" id="hamburger-btn" aria-label="菜单" onclick="toggleMobileMenu()">';
  html += '<span></span><span></span><span></span>';
  html += '</button>';

  html += '</div>';
  html += '</header>';

  // ---- 注入到占位元素 ----
  var placeholder = document.getElementById('global-nav');
  if (placeholder) {
    placeholder.outerHTML = html;
  }

  // ---- 给"退出"按钮绑定事件（nav.js 自包含，不依赖 userCenter.js） ----
  var logoutBtn = document.getElementById('nav-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      // 优先调用 UserCenter.logout() 做完整清理（toast提示、清除缓存等）
      if (typeof UserCenter !== 'undefined' && UserCenter.logout) {
        UserCenter.logout();
      }
      try {
        localStorage.removeItem('pingyao_user_profile');
      } catch (_) { /* ignore */ }
      // 无论 userCenter 是否存在，都刷新页面以确保 nav 重新生成
      window.location.reload();
    });
  }
})();

// ---- 移动端菜单切换函数（全局可访问） ----
function toggleMobileMenu() {
  var navLinks = document.querySelector('.nav-links');
  var hamburger = document.getElementById('hamburger-btn');
  if (navLinks) {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
  }
}

// ---- 点击导航链接后自动关闭移动端菜单 ----
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.nav-links a').forEach(function(link) {
    link.addEventListener('click', function() {
      var navLinks = document.querySelector('.nav-links');
      var hamburger = document.getElementById('hamburger-btn');
      if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
      }
    });
  });
});
