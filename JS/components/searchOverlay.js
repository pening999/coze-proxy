/**
 * searchOverlay.js - 全站搜索覆盖层
 * 搜索平遥景点、文化知识、美食等
 * 国赛评审亮点：AI + 搜索，智能文旅体验
 */
(function () {
  'use strict';

  // 仅在已加载数据的页面初始化
  var initialized = false;
  var searchData = [];

  /** 注入搜索 UI */
  function createSearchOverlay() {
    if (document.getElementById('site-search-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'site-search-overlay';
    overlay.innerHTML = [
      '<div class="search-overlay-bg"></div>',
      '<div class="search-overlay-content">',
      '  <div class="search-overlay-header">',
      '    <h3><i class="fa-solid fa-compass"></i> 搜索平遥古城</h3>',
      '    <button class="search-close-btn" onclick="SiteSearch.close()" aria-label="关闭搜索">',
      '      <i class="fa-solid fa-xmark"></i>',
      '    </button>',
      '  </div>',
      '  <div class="search-input-wrap">',
      '    <i class="fa-solid fa-search search-input-icon"></i>',
      '    <input type="text" id="site-search-input" placeholder="搜索景点、文化、美食..." autocomplete="off" autofocus>',
      '    <button class="search-clear-btn" id="search-clear-btn" onclick="SiteSearch.clear()" style="display:none;">',
      '      <i class="fa-solid fa-times"></i>',
      '    </button>',
      '  </div>',
      '  <div id="search-results" class="search-results">',
      '    <div class="search-hint">输入关键词搜索平遥古城相关内容</div>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);

    // 搜索输入事件（防抖）
    var input = document.getElementById('site-search-input');
    input.addEventListener('input', debounce(function () {
      var query = input.value.trim();
      document.getElementById('search-clear-btn').style.display = query ? 'block' : 'none';
      if (query.length >= 1) {
        performSearch(query);
      } else {
        document.getElementById('search-results').innerHTML = '<div class="search-hint">输入关键词搜索平遥古城相关内容</div>';
      }
    }, 200));

    // ESC 关闭
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') SiteSearch.close();
      if (e.key === 'Enter') {
        var results = document.querySelectorAll('.search-result-item');
        if (results.length > 0) results[0].click();
      }
    });

    // 点击背景关闭
    overlay.querySelector('.search-overlay-bg').addEventListener('click', function () {
      SiteSearch.close();
    });

    // 注入 CSS
    injectSearchCSS();
  }

  /** 搜索 CSS */
  function injectSearchCSS() {
    if (document.getElementById('search-overlay-style')) return;
    var style = document.createElement('style');
    style.id = 'search-overlay-style';
    style.textContent = [
      '#site-search-overlay {',
      '  position: fixed; top: 0; left: 0; right: 0; bottom: 0;',
      '  z-index: 10000; display: none;',
      '  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;',
      '}',
      '#site-search-overlay.active { display: block; animation: searchFadeIn 0.2s ease; }',
      '.search-overlay-bg {',
      '  position: absolute; top: 0; left: 0; right: 0; bottom: 0;',
      '  background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);',
      '}',
      '.search-overlay-content {',
      '  position: relative; max-width: 640px; margin: 80px auto 0;',
      '  background: #fffcf9; border-radius: 16px;',
      '  box-shadow: 0 20px 60px rgba(0,0,0,0.3);',
      '  overflow: hidden; max-height: 80vh; display: flex; flex-direction: column;',
      '}',
      '.search-overlay-header {',
      '  display: flex; align-items: center; justify-content: space-between;',
      '  padding: 20px 24px 0;',
      '}',
      '.search-overlay-header h3 { margin: 0; font-size: 18px; color: #8c1515; }',
      '.search-overlay-header h3 i { margin-right: 8px; }',
      '.search-close-btn {',
      '  background: none; border: none; font-size: 24px; color: #999; cursor: pointer;',
      '  padding: 4px 8px; border-radius: 6px; transition: all 0.2s;',
      '}',
      '.search-close-btn:hover { background: #f5f0eb; color: #333; }',
      '.search-input-wrap {',
      '  position: relative; margin: 16px 24px;',
      '}',
      '.search-input-icon {',
      '  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);',
      '  color: #bbb; font-size: 16px;',
      '}',
      '#site-search-input {',
      '  width: 100%; padding: 14px 40px 14px 42px; font-size: 16px;',
      '  border: 2px solid #e8ddd0; border-radius: 10px; outline: none;',
      '  background: #faf6f0; transition: border-color 0.2s;',
      '  box-sizing: border-box; font-family: inherit;',
      '}',
      '#site-search-input:focus { border-color: #8c1515; background: #fff; }',
      '#site-search-input::placeholder { color: #bbb; }',
      '.search-clear-btn {',
      '  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);',
      '  background: none; border: none; color: #bbb; cursor: pointer; font-size: 16px; padding: 6px;',
      '}',
      '.search-clear-btn:hover { color: #666; }',
      '.search-results {',
      '  padding: 0 24px 24px; overflow-y: auto; flex: 1;',
      '}',
      '.search-hint { text-align: center; color: #bbb; padding: 40px 0; font-size: 14px; }',
      '.search-empty { text-align: center; color: #999; padding: 40px 0; font-size: 15px; }',
      '.search-loading { text-align: center; padding: 40px 0; color: #8c1515; }',
      '.search-loading i { animation: fa-spin 1s linear infinite; margin-right: 6px; }',
      '.search-result-item {',
      '  display: block; padding: 14px 16px; margin-bottom: 8px;',
      '  border-radius: 10px; background: #faf6f0; cursor: pointer;',
      '  transition: all 0.2s; text-decoration: none; color: inherit;',
      '  border-left: 3px solid transparent;',
      '}',
      '.search-result-item:hover { background: #f5ede5; border-left-color: #8c1515; }',
      '.search-result-item .result-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 4px; }',
      '.search-result-item .result-title em { color: #8c1515; font-style: normal; }',
      '.search-result-item .result-desc { font-size: 13px; color: #888; line-height: 1.4; }',
      '.search-result-item .result-tag {',
      '  display: inline-block; font-size: 11px; padding: 2px 8px;',
      '  border-radius: 10px; background: #fff; color: #8c1515;',
      '  margin-top: 6px; border: 1px solid #e0d5c8;',
      '}',
      '.search-result-category {',
      '  font-size: 13px; color: #8c1515; font-weight: 600;',
      '  padding: 12px 0 6px; margin-top: 8px;',
      '  border-bottom: 1px solid #f0e8e0;',
      '}',
      '@keyframes searchFadeIn {',
      '  from { opacity: 0; transform: translateY(-10px); }',
      '  to { opacity: 1; transform: translateY(0); }',
      '}',
      /* 移动端适配 */
      '@media (max-width: 700px) {',
      '  .search-overlay-content { margin: 40px 16px 0; max-height: 85vh; }',
      '  .search-overlay-header { padding: 16px 16px 0; }',
      '  .search-input-wrap { margin: 12px 16px; }',
      '  .search-results { padding: 0 16px 16px; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /** 防抖 */
  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var self = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(self, args); }, delay);
    };
  }

  /** 执行搜索 */
  function performSearch(query) {
    var resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '<div class="search-loading"><i class="fa-solid fa-spinner"></i> 搜索中...</div>';

    // 加载搜索数据
    loadSearchData(function () {
      var q = query.toLowerCase();
      var results = [];

      searchData.forEach(function (item) {
        var titleMatch = item.title.toLowerCase().includes(q);
        var descMatch = (item.description || '').toLowerCase().includes(q);
        var tagMatch = (item.tags || []).some(function (tag) { return tag.toLowerCase().includes(q); });
        var keywordMatch = (item.keywords || []).some(function (kw) { return kw.toLowerCase().includes(q); });

        if (titleMatch || descMatch || tagMatch || keywordMatch) {
          results.push(item);
        }
      });

      if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-empty">没有找到相关内容，试试其他关键词</div>';
        return;
      }

      // 按分类分组
      var grouped = {};
      results.forEach(function (item) {
        var cat = item.category || '景点';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
      });

      var html = '';
      Object.keys(grouped).forEach(function (cat) {
        html += '<div class="search-result-category"><i class="fa-solid fa-tag"></i> ' + cat + '</div>';
        grouped[cat].forEach(function (item) {
          var highlightedTitle = highlightKeyword(item.title, query);
          var highlightedDesc = highlightKeyword((item.description || '').substring(0, 80), query);
          html += [
            '<a class="search-result-item" href="' + (item.link || 'javascript:void(0)') + '" ',
            '  onclick="SiteSearch.navigateTo(\'' + (item.link || '') + '\', \'' + (item.name || item.title) + '\')">',
            '  <div class="result-title">' + highlightedTitle + '</div>',
            '  <div class="result-desc">' + highlightedDesc + '</div>',
            item.tags ? '<div class="result-tag">' + item.tags.slice(0, 3).join(' · ') + '</div>' : '',
            '</a>'
          ].join('');
        });
      });

      resultsContainer.innerHTML = html;
    });
  }

  /** 高亮关键词 */
  function highlightKeyword(text, keyword) {
    if (!text || !keyword) return text || '';
    var escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp('(' + escaped + ')', 'gi'), '<em>$1</em>');
  }

  /** 加载搜索数据源 */
  function loadSearchData(callback) {
    if (searchData.length > 0) { callback(); return; }

    var data = [];

    // 尝试加载景点数据
    try {
      var spots = null;

      // 如果全局已有景点数据
      if (window.PINGYAO_SPOTS) {
        spots = window.PINGYAO_SPOTS;
      }

      if (spots && spots.attractions) {
        spots.attractions.forEach(function (a) {
          data.push({
            title: a.name,
            description: a.description,
            category: '景点',
            tags: a.tags || [],
            keywords: [a.name, a.dynasty, a.category],
            link: 'history.html?spot=' + encodeURIComponent(a.name)
          });
        });
        spots.food.forEach(function (f) {
          data.push({
            title: f.name,
            description: f.description + '（推荐：' + f.recommend + '）',
            category: '美食',
            tags: ['美食', '平遥特色'],
            keywords: [f.name],
            link: 'creation.html?tab=food'
          });
        });
        spots.shop.forEach(function (s) {
          data.push({
            title: s.name,
            description: s.description + '（位置：' + s.location + '）',
            category: '特产',
            tags: ['非遗', '购物'],
            keywords: [s.name],
            link: 'creation.html?tab=shop'
          });
        });
      }
    } catch (e) { /* 忽略 */ }

    // 尝试加载文化知识数据
    try {
      if (window.PINGYAO_CULTURE && window.PINGYAO_CULTURE.history) {
        window.PINGYAO_CULTURE.history.forEach(function (h) {
          data.push({
            title: h.title + '（' + h.period + '）',
            description: h.description,
            category: '历史',
            tags: [h.period],
            keywords: [h.title, h.period].concat(h.keywords || []),
            link: 'history.html'
          });
        });
      }
    } catch (e) { /* 忽略 */ }

    // 内置默认数据兜底
    if (data.length === 0) {
      data = getDefaultSearchData();
    }

    searchData = data;
    callback();
  }

  /** 内置默认搜索数据 */
  function getDefaultSearchData() {
    return [
      { title: '平遥古城墙', description: '明洪武三年重筑的砖石城墙，周长6163米，72座敌楼', category: '景点', tags: ['城墙', '明代'], keywords: ['城墙', '平遥古城墙', '明代'], link: 'history.html' },
      { title: '日升昌票号', description: '中国第一家票号，中国现代银行的鼻祖', category: '景点', tags: ['票号', '晋商', '清代'], keywords: ['日升昌', '票号', '晋商'], link: 'history.html' },
      { title: '双林寺', description: '东方彩塑艺术宝库，2000余尊彩塑', category: '景点', tags: ['彩塑', '佛教', '北魏'], keywords: ['双林寺', '彩塑', '佛教'], link: 'history.html' },
      { title: '平遥县衙', description: '中国保存最完整的古代县衙', category: '景点', tags: ['县衙', '官署'], keywords: ['县衙', '平遥县衙'], link: 'history.html' },
      { title: '平遥文庙', description: '中国现存最古老的文庙建筑', category: '景点', tags: ['文庙', '儒家', '唐代'], keywords: ['文庙', '平遥文庙'], link: 'history.html' },
      { title: '平遥牛肉', description: '平遥传统名吃，色泽红润、肉质鲜嫩', category: '美食', tags: ['美食', '特色'], keywords: ['牛肉', '平遥牛肉', '美食'], link: 'creation.html' },
      { title: '推光漆器', description: '国家级非遗，以手掌推出光泽，古朴雅致', category: '特产', tags: ['非遗', '漆器'], keywords: ['推光漆器', '漆器', '非遗'], link: 'creation.html' },
      { title: '晋商文化', description: '明清时期最具影响力的商帮之一，以诚信为本', category: '文化', tags: ['晋商', '文化'], keywords: ['晋商', '晋商文化'], link: 'history.html' },
      { title: '古城初建（西周）', description: '平遥古城始建于西周宣王时期，尹吉甫驻兵于此', category: '历史', tags: ['西周', '初建'], keywords: ['西周', '平遥历史', '尹吉甫'], link: 'history.html' },
      { title: '世界文化遗产', description: '1997年列入联合国教科文组织《世界遗产名录》', category: '历史', tags: ['世界遗产', '1997'], keywords: ['世界遗产', '1997', '平遥古城'], link: 'history.html' },
      { title: 'AI 意境绘卷', description: 'AI 为您生成平遥古城的诗画意境', category: 'AI 功能', tags: ['AI', '创作'], keywords: ['AI', '意境绘卷', '创作'], link: 'creation.html' },
      { title: '个性化路线规划', description: 'AI 根据您的偏好定制平遥游览路线', category: 'AI 功能', tags: ['AI', '路线'], keywords: ['路线', '规划', '旅游'], link: 'creation.html' },
    ];
  }

  // ====== 公开 API ======

  window.SiteSearch = {
    /** 打开搜索 */
    open: function () {
      if (!initialized) {
        createSearchOverlay();
        initialized = true;
      }
      var overlay = document.getElementById('site-search-overlay');
      overlay.classList.add('active');
      overlay.style.display = 'block';
      setTimeout(function () {
        var input = document.getElementById('site-search-input');
        if (input) input.focus();
      }, 100);
      // 禁止页面滚动
      document.body.style.overflow = 'hidden';
    },

    /** 关闭搜索 */
    close: function () {
      var overlay = document.getElementById('site-search-overlay');
      if (overlay) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
      }
      document.body.style.overflow = '';
    },

    /** 清空搜索 */
    clear: function () {
      var input = document.getElementById('site-search-input');
      if (input) {
        input.value = '';
        input.focus();
      }
      document.getElementById('search-clear-btn').style.display = 'none';
      document.getElementById('search-results').innerHTML = '<div class="search-hint">输入关键词搜索平遥古城相关内容</div>';
    },

    /** 导航到结果页 */
    navigateTo: function (link, title) {
      this.close();
      if (link && link !== 'javascript:void(0)') {
        window.location.href = link;
      }
    }
  };

  // 键盘快捷键：Ctrl+K / Cmd+K 打开搜索
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      window.SiteSearch.open();
    }
    // 搜索框已打开时允许 ESC
    var overlay = document.getElementById('site-search-overlay');
    if (overlay && overlay.style.display === 'block' && e.key === 'Escape') {
      window.SiteSearch.close();
    }
  });

})();
