/**
 * 用户中心模块
 * 管理用户登录状态、偏好设置、个人中心展示
 * 当前使用 localStorage 模拟
 */

const UserCenter = {
  /** 当前登录用户 */
  _currentUser: null,

  /** 初始化用户中心 */
  init() {
    this._loadUser();
    this._updateUI();
    this._bindEvents();
  },

  /** 从 localStorage 加载用户信息 */
  _loadUser() {
    const userData = StorageUtils.get(STORAGE_KEYS.USER_PROFILE);
    if (userData && userData.isLoggedIn) {
      this._currentUser = userData;
    } else {
      // 默认游客状态
      this._currentUser = {
        username: '游客',
        isLoggedIn: false,
        avatar: 'IMG/TX.jpg'
      };
    }
  },

  /** 保存用户信息到 localStorage */
  _saveUser() {
    StorageUtils.set(STORAGE_KEYS.USER_PROFILE, this._currentUser);
  },

  /** 更新 UI（导航栏用户状态） */
  _updateUI() {
    const usernameEl = document.getElementById('username');
    const avatarEl = document.querySelector('.user-avatar img');
    const logoutBtn = document.querySelector('.logout-btn');
    // 缓存登录链接引用，避免 logout() 后 href 被改导致查不到
    if (!this._loginLinkRef) {
      this._loginLinkRef = document.querySelector('.nav-links a[href="login.html"]');
    }
    const loginLink = this._loginLinkRef;

    if (!this._currentUser.isLoggedIn) {
      // 未登录状态：导航栏显示"登录"
      if (loginLink) {
        loginLink.textContent = '登录';
        loginLink.href = 'login.html';
        loginLink.style.display = '';
      }
      // 移除已有的退出按钮
      const existLogout = document.querySelector('.nav-logout-btn');
      if (existLogout) existLogout.remove();
    } else {
      // 已登录状态：显示用户名 + 退出按钮
      if (loginLink) {
        loginLink.textContent = this._currentUser.username;
        loginLink.href = 'usercenter.html';
      }
      // 检查是否已有退出按钮
      if (!document.querySelector('.nav-logout-btn')) {
        const li = loginLink?.parentElement;
        if (li) {
          const logoutLi = document.createElement('li');
          logoutLi.innerHTML = '<a href="#" class="nav-logout-btn" style="color:#c0392b;">退出</a>';
          li.parentElement.insertBefore(logoutLi, li.nextSibling);
          logoutLi.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
          });
        }
      }
    }

    if (usernameEl) {
      usernameEl.textContent = this._currentUser.username || '游客';
    }
    if (avatarEl && this._currentUser.avatar) {
      avatarEl.src = this._currentUser.avatar;
    }
  },

  /** 绑定事件 */
  _bindEvents() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
  },

  /** 用户登录 */
  login(username, password) {
    // 测试账户快捷登录
    if (username === 'test' && password === '123456') {
      const users = StorageUtils.get('pingyao_users', []);
      const exists = users.find(u => u.username === 'test');
      if (!exists) {
        users.push({
          username: 'test',
          password: '123456',
          email: '',
          phone: '',
          avatar: 'IMG/TX.jpg',
          registeredAt: new Date().toISOString()
        });
        StorageUtils.set('pingyao_users', users);
      }
      this._currentUser = {
        username: 'test',
        isLoggedIn: true,
        avatar: 'IMG/TX.jpg',
        email: '',
        phone: ''
      };
      this._saveUser();
      this._updateUI();
      ErrorHandler.toast('登录成功！欢迎回来，test', 'success');
      return true;
    }

    // 模拟登录验证
    const users = StorageUtils.get('pingyao_users', []);
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      this._currentUser = {
        username: user.username,
        isLoggedIn: true,
        avatar: user.avatar || 'IMG/TX.jpg',
        email: user.email || '',
        phone: user.phone || ''
      };
      this._saveUser();
      this._updateUI();
      ErrorHandler.toast('登录成功！欢迎回来，' + username, 'success');
      return true;
    } else {
      // 如果没有任何用户，自动注册并登录（评审演示模式）
      if (users.length === 0) {
        this.register(username, password);
        return this.login(username, password);
      }
      ErrorHandler.toast('用户名或密码错误', 'error');
      return false;
    }
  },

  /** 用户注册 */
  register(username, password, email = '', phone = '') {
    if (!Validators.isValidUsername(username)) {
      ErrorHandler.toast('用户名格式不正确（2-20位，支持中文、字母、数字）', 'error');
      return false;
    }
    if (!Validators.isValidPassword(password)) {
      ErrorHandler.toast('密码长度需要6-20位', 'error');
      return false;
    }

    const users = StorageUtils.get('pingyao_users', []);
    if (users.find(u => u.username === username)) {
      ErrorHandler.toast('用户名已存在', 'error');
      return false;
    }

    users.push({
      username,
      password,
      email,
      phone,
      avatar: 'IMG/TX.jpg',
      registeredAt: new Date().toISOString()
    });
    StorageUtils.set('pingyao_users', users);
    ErrorHandler.toast('注册成功！请登录', 'success');
    return true;
  },

  /** 退出登录 */
  logout() {
    this._currentUser = {
      username: '游客',
      isLoggedIn: false,
      avatar: 'IMG/TX.jpg'
    };
    this._saveUser();
    this._updateUI();
    ErrorHandler.toast('已退出登录', 'info');
  },

  /** 获取当前用户信息 */
  getUser() {
    return { ...this._currentUser };
  },

  /** 检查是否已登录 */
  isLoggedIn() {
    return this._currentUser && this._currentUser.isLoggedIn;
  },

  /** 获取用户路线记录 */
  getUserRoutes() {
    return StorageUtils.getRoutes();
  },

  /** 获取用户创作记录 */
  getUserCreations() {
    return StorageUtils.getCreations();
  },

  /** 渲染用户中心页面 */
  renderProfilePage(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = this.getUser();
    const routes = this.getUserRoutes();
    const creations = this.getUserCreations();

    container.innerHTML = `
      <div class="profile-container">
        <!-- 用户信息卡 -->
        <div class="profile-card">
          <div class="profile-avatar">
            <img src="${user.avatar || 'IMG/TX.jpg'}" alt="头像">
          </div>
          <div class="profile-info">
            <h3>${user.username}</h3>
            <p class="profile-status">${user.isLoggedIn ? '已登录' : '游客模式'}</p>
            <p class="profile-tip">${user.isLoggedIn ? '您的路线和创作已保存在本地' : '登录后可同步路线和创作记录'}</p>
          </div>
          ${!user.isLoggedIn
            ? '<a href="login.html" class="profile-login-btn">去登录</a>'
            : '<a href="#" class="profile-login-btn" id="profile-logout-btn" style="background:#c0392b;">退出登录</a>'}
        </div>

        <!-- 统计数据 -->
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-number">${routes.length}</span>
            <span class="stat-label">我的路线</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${creations.length}</span>
            <span class="stat-label">我的创作</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${StorageUtils.getFavorites().length}</span>
            <span class="stat-label">我的收藏</span>
          </div>
        </div>

        <!-- Tab 切换 -->
        <div class="profile-tabs">
          <button class="profile-tab active" onclick="UserCenter.switchTab('routes')">
            <i class="fa-solid fa-route"></i> 我的路线
          </button>
          <button class="profile-tab" onclick="UserCenter.switchTab('creations')">
            <i class="fa-solid fa-pen-fancy"></i> 我的创作
          </button>
          <button class="profile-tab" onclick="UserCenter.switchTab('settings')">
            <i class="fa-solid fa-gear"></i> 偏好设置
          </button>
          <button class="profile-tab" onclick="UserCenter.switchTab('favorites')">
            <i class="fa-solid fa-bookmark"></i> 我的收藏
          </button>
        </div>

        <!-- Tab 内容 -->
        <div id="profile-tab-content" class="profile-tab-content">
          ${this._renderRoutesTab(routes)}
        </div>
      </div>
    `;

    // 绑定个人中心退出按钮
    const profileLogoutBtn = document.getElementById('profile-logout-btn');
    if (profileLogoutBtn) {
      profileLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
        this.renderProfilePage(containerId);
      });
    }
  },

  /** 切换 Tab */
  switchTab(tabName) {
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    const activeTab = [...tabs].find(t => {
      const onclick = t.getAttribute('onclick') || '';
      return onclick.includes(tabName);
    });
    if (activeTab) activeTab.classList.add('active');

    const container = document.getElementById('profile-tab-content');
    if (!container) return;

    switch (tabName) {
      case 'routes':
        container.innerHTML = this._renderRoutesTab(this.getUserRoutes());
        break;
      case 'creations':
        container.innerHTML = this._renderCreationsTab(this.getUserCreations());
        break;
      case 'settings':
        container.innerHTML = this._renderSettingsTab();
        break;
      case 'favorites':
        container.innerHTML = this._renderFavoritesTab();
        break;
    }
  },

  /** 渲染路线 Tab */
  _renderRoutesTab(routes) {
    if (routes.length === 0) {
      return `
        <div class="profile-empty">
          <i class="fa-solid fa-map"></i>
          <p>还没有生成过路线</p>
          <a href="creation.html" class="action-btn" style="display:inline-block;margin-top:15px;padding:10px 20px;background:#8c1515;color:white;text-decoration:none;border-radius:5px;">
            去生成路线
          </a>
        </div>
      `;
    }

    return routes.map(route => `
      <div class="profile-item-card">
        <div class="profile-item-header">
          <h4>${route.title || '我的路线'}</h4>
          <span class="profile-item-date">${new Date(route.createdAt).toLocaleDateString()}</span>
        </div>
        <p class="profile-item-summary">${route.summary || ''}</p>
        <div class="profile-item-meta">
          <span><i class="fa-solid fa-clock"></i> ${route.duration || ''}</span>
        </div>
        <div class="profile-item-actions">
          <button class="icon-btn" onclick="StorageUtils.deleteRoute('${route.id}');UserCenter.switchTab('routes')">
            <i class="fa-solid fa-trash-can"></i> 删除
          </button>
        </div>
      </div>
    `).join('');
  },

  /** 渲染创作 Tab */
  _renderCreationsTab(creations) {
    if (creations.length === 0) {
      return `
        <div class="profile-empty">
          <i class="fa-solid fa-pen-fancy"></i>
          <p>还没有创作过内容</p>
          <a href="creation.html" class="action-btn" style="display:inline-block;margin-top:15px;padding:10px 20px;background:#8c1515;color:white;text-decoration:none;border-radius:5px;">
            去创作
          </a>
        </div>
      `;
    }

    return creations.map(creation => `
      <div class="profile-item-card">
        <div class="profile-item-header">
          <h4>${creation.type === 'image' ? '🖼️ 意境绘卷' : creation.type === 'rewrite' ? '✍️ 故里新篇' : '📋 灵感拾遗'}</h4>
          <span class="profile-item-date">${new Date(creation.createdAt).toLocaleDateString()}</span>
        </div>
        <p class="profile-item-summary">${creation.prompt || creation.content?.substring(0, 100) || ''}</p>
        <div class="profile-item-actions">
          <button class="icon-btn" onclick="StorageUtils.deleteCreation('${creation.id}');UserCenter.switchTab('creations')">
            <i class="fa-solid fa-trash-can"></i> 删除
          </button>
        </div>
      </div>
    `).join('');
  },

  /** 渲染设置 Tab */
  _renderSettingsTab() {
    const prefs = StorageUtils.getPreferences();
    return `
      <div class="profile-settings">
        <div class="setting-item">
          <label>游玩偏好</label>
          <select id="pref-duration" class="setting-select">
            <option value="">请选择</option>
            <option value="半日" ${prefs.duration === '半日' ? 'selected' : ''}>半日</option>
            <option value="一日" ${prefs.duration === '一日' ? 'selected' : ''}>一日</option>
            <option value="两日" ${prefs.duration === '两日' ? 'selected' : ''}>两日</option>
          </select>
        </div>
        <div class="setting-item">
          <label>兴趣偏好（多选）</label>
          <div class="setting-checkboxes">
            ${['历史', '文化', '美食', '摄影', '建筑', '亲子'].map(interest => `
              <label class="setting-checkbox">
                <input type="checkbox" value="${interest}" ${(prefs.interests || []).includes(interest) ? 'checked' : ''}>
                ${interest}
              </label>
            `).join('')}
          </div>
        </div>
        <button class="action-btn" onclick="UserCenter.saveSettings()" style="margin-top:20px;background:#8c1515;color:white;border:none;padding:12px 24px;border-radius:5px;cursor:pointer;">
          <i class="fa-solid fa-floppy-disk"></i> 保存偏好
        </button>
      </div>
    `;
  },

  /** 渲染收藏 Tab */
  _renderFavoritesTab() {
    const favorites = StorageUtils.getFavorites();
    if (favorites.length === 0) {
      return `
        <div class="profile-empty">
          <i class="fa-solid fa-bookmark"></i>
          <p>还没有收藏任何内容</p>
          <a href="首页.html" class="action-btn" style="display:inline-block;margin-top:15px;padding:10px 20px;background:#8c1515;color:white;text-decoration:none;border-radius:5px;">
            去探索古城
          </a>
        </div>
      `;
    }

    const typeIcons = {
      attraction: '<i class="fa-solid fa-landmark"></i>',
      route: '<i class="fa-solid fa-route"></i>',
      article: '<i class="fa-solid fa-newspaper"></i>',
      image: '<i class="fa-solid fa-image"></i>'
    };

    return favorites.map(item => `
      <div class="profile-item-card">
        <div class="profile-item-header">
          <h4>${typeIcons[item.type] || '<i class="fa-solid fa-star"></i>'} ${item.title || '收藏项目'}</h4>
          <span class="profile-item-date">${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
        </div>
        <p class="profile-item-summary">${item.summary || item.description || ''}</p>
        <div class="profile-item-actions">
          <button class="icon-btn" onclick="StorageUtils.deleteFavorite('${item.id}');UserCenter.switchTab('favorites')">
            <i class="fa-solid fa-trash-can"></i> 删除
          </button>
        </div>
      </div>
    `).join('');
  },

  /** 保存偏好设置 */
  saveSettings() {
    const duration = document.getElementById('pref-duration')?.value || '';
    const checkboxes = document.querySelectorAll('.setting-checkbox input:checked');
    const interests = Array.from(checkboxes).map(cb => cb.value);

    StorageUtils.savePreferences({ duration, interests });
    ErrorHandler.toast('偏好设置已保存', 'success');
  }
};

// 导出到全局
window.UserCenter = UserCenter;
