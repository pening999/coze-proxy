/**
 * localStorage 工具模块
 * 用于用户偏好、路线记录、创作记录的本地存储
 */

const STORAGE_KEYS = {
  USER_PREFERENCES: 'pingyao_user_preferences',
  ROUTE_HISTORY: 'pingyao_route_history',
  CREATION_HISTORY: 'pingyao_creation_history',
  USER_PROFILE: 'pingyao_user_profile',
  FEEDBACK: 'pingyao_feedback',
  FAVORITES: 'pingyao_favorites'
};

const StorageUtils = {
  /** 获取存储数据（自动处理 JSON 解析） */
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn('StorageUtils.get 解析失败:', key, e);
      return defaultValue;
    }
  },

  /** 检查存储空间是否充足（约 4.5MB 阈值） */
  _checkQuota() {
    try {
      const testKey = '_quota_test_';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },

  /** 清理最旧的数据以释放空间 */
  _makeRoom() {
    // 按策略清理：先清理反馈数据，再清理最旧的创作记录
    const cleanupOrder = [
      { key: STORAGE_KEYS.FEEDBACK, label: '反馈记录' },
      { key: STORAGE_KEYS.ROUTE_HISTORY, label: '路线记录' },
      { key: STORAGE_KEYS.CREATION_HISTORY, label: '创作记录' },
    ];
    for (const { key, label } of cleanupOrder) {
      const data = this.get(key, []);
      if (data.length > 0) {
        // 删除一半最旧的数据
        const keepCount = Math.ceil(data.length / 2);
        const kept = data.slice(0, keepCount);
        this.set(key, kept);
        console.warn(`[Storage] 存储空间不足，已清理部分${label}`);
        if (this._checkQuota()) return true;
      }
    }
    return false;
  },

  /** 设置存储数据（自动 JSON 序列化 + 容量异常处理） */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      // 存储空间满时尝试自动清理
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.warn('[Storage] 存储空间已满，尝试自动清理...');
        if (this._makeRoom()) {
          try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
          } catch (e2) {
            console.warn('[Storage] 清理后仍无法存储:', e2);
          }
        }
        console.warn('[Storage] 存储失败，请删除部分数据后重试');
      } else {
        console.warn('StorageUtils.set 存储失败:', key, e);
      }
      return false;
    }
  },

  /** 删除某个键 */
  remove(key) {
    localStorage.removeItem(key);
  },

  /** 清空所有应用数据 */
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },

  // ======== 用户偏好 ========

  /** 保存用户偏好 */
  savePreferences(prefs) {
    const existing = this.get(STORAGE_KEYS.USER_PREFERENCES, {});
    const merged = { ...existing, ...prefs, updatedAt: new Date().toISOString() };
    return this.set(STORAGE_KEYS.USER_PREFERENCES, merged);
  },

  /** 获取用户偏好 */
  getPreferences() {
    return this.get(STORAGE_KEYS.USER_PREFERENCES, {});
  },

  // ======== 路线记录 ========

  /** 保存生成的路线 */
  saveRoute(route) {
    const routes = this.get(STORAGE_KEYS.ROUTE_HISTORY, []);
    const newRoute = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ...route,
      createdAt: new Date().toISOString()
    };
    routes.unshift(newRoute);
    // 最多保留 20 条
    if (routes.length > 20) routes.pop();
    return this.set(STORAGE_KEYS.ROUTE_HISTORY, routes), newRoute;
  },

  /** 获取所有路线记录 */
  getRoutes() {
    return this.get(STORAGE_KEYS.ROUTE_HISTORY, []);
  },

  /** 删除指定路线 */
  deleteRoute(id) {
    const routes = this.getRoutes().filter(r => r.id !== id);
    return this.set(STORAGE_KEYS.ROUTE_HISTORY, routes);
  },

  // ======== 创作记录 ========

  /** 保存创作记录 */
  saveCreation(creation) {
    const creations = this.get(STORAGE_KEYS.CREATION_HISTORY, []);
    const newCreation = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ...creation,
      createdAt: new Date().toISOString()
    };
    creations.unshift(newCreation);
    if (creations.length > 30) creations.pop();
    return this.set(STORAGE_KEYS.CREATION_HISTORY, creations), newCreation;
  },

  /** 获取创作记录 */
  getCreations() {
    return this.get(STORAGE_KEYS.CREATION_HISTORY, []);
  },

  /** 删除创作记录 */
  deleteCreation(id) {
    const creations = this.getCreations().filter(c => c.id !== id);
    return this.set(STORAGE_KEYS.CREATION_HISTORY, creations);
  },

  // ======== 反馈记录 ========

  /** 保存用户反馈 */
  saveFeedback(feedback) {
    const feedbacks = this.get(STORAGE_KEYS.FEEDBACK, []);
    feedbacks.push({
      id: Date.now().toString(36),
      ...feedback,
      createdAt: new Date().toISOString()
    });
    return this.set(STORAGE_KEYS.FEEDBACK, feedbacks);
  },

  // ======== 收藏管理 ========

  /** 保存收藏（自动去重，同一 type + content 不重复） */
  saveFavorite(item) {
    const favorites = this.get(STORAGE_KEYS.FAVORITES, []);
    // 检查是否已存在相同 type + content
    const exists = favorites.some(f => f.type === item.type && f.content === item.content);
    if (exists) return false;
    const newFavorite = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ...item,
      createdAt: new Date().toISOString()
    };
    favorites.unshift(newFavorite);
    return this.set(STORAGE_KEYS.FAVORITES, favorites), newFavorite;
  },

  /** 获取所有收藏 */
  getFavorites() {
    return this.get(STORAGE_KEYS.FAVORITES, []);
  },

  /** 删除指定收藏 */
  deleteFavorite(id) {
    const favorites = this.getFavorites().filter(f => f.id !== id);
    return this.set(STORAGE_KEYS.FAVORITES, favorites);
  },

  /** 检查是否已收藏（根据 type 和 content） */
  isFavorite(type, content) {
    const favorites = this.get(STORAGE_KEYS.FAVORITES, []);
    return favorites.some(f => f.type === type && f.content === content);
  }
};

// 导出到全局
window.StorageUtils = StorageUtils;
window.STORAGE_KEYS = STORAGE_KEYS;
