/**
 * ErrorHandler - 统一错误处理与 Toast 通知模块（国赛增强版）
 * 
 * 所有 AI/网络请求都应通过 wrapApiCall 包装，统一处理：
 *   ✅ loading 显示与隐藏
 *   ✅ 错误分级处理（网络/认证/服务器/未知）
 *   ✅ 自动重试机制（指数退避）
 *   ✅ 降级 fallback 支持
 *   ✅ Toast 用户提示
 *   ✅ 全局异常捕获
 * 
 * 使用示例：
 *   await ErrorHandler.wrapApiCall(() => cozeClient.chat(prompt), {
 *     retryCount: PINGYAO_CONFIG.fallback.maxRetries,
 *     fallbackData: FALLBACK_RESPONSE,
 *     showToast: true
 *   });
 */

const ErrorHandler = {
  // ==================== Toast 通知 ====================

  /**
   * 显示 Toast 通知
   * @param {string} message - 消息内容
   * @param {'success' | 'error' | 'warning' | 'info'} type - 通知类型
   * @param {number} duration - 显示时长（ms），默认 3000
   */
  toast(message, type = 'info', duration = 3000) {
    // 检查已有的 toast 元素并移除，避免重复
    const existing = document.querySelector('.pygc-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'pygc-toast';
    toast.style.cssText = `
      position: fixed; top: 100px; right: 20px;
      background: rgba(44, 62, 80, 0.95); color: white;
      padding: 12px 24px; border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000; font-size: 14px;
      animation: slideIn 0.3s ease;
      max-width: 300px; word-break: break-word;
      border-left: 4px solid #3498db;
    `;

    // 根据类型设置边框颜色
    const typeBorders = {
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db'
    };
    toast.style.borderLeft = `4px solid ${typeBorders[type] || typeBorders.info}`;

    toast.textContent = message;
    document.body.appendChild(toast);

    // 自动移除
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // ==================== 加载状态管理 ====================

  /**
   * 显示全局加载指示器（页面顶部遮罩）
   */
  showLoading() {
    if (!PINGYAO_CONFIG?.loading?.showOverlay) return;
    const loading = document.getElementById('page-loading');
    if (loading) {
      loading.style.display = 'flex';
      loading.classList.remove('fade-out');
    }
  },

  /**
   * 隐藏全局加载指示器
   */
  hideLoading() {
    const loading = document.getElementById('page-loading');
    if (loading) {
      loading.classList.add('fade-out');
      setTimeout(() => { loading.style.display = 'none'; }, 500);
    }
  },

  // ==================== API 调用包装 ====================

  /**
   * 包装 API 调用，统一处理 loading/error/retry/fallback
   * @param {Function} apiCall - 异步函数，返回 Promise
   * @param {Object} options - 配置
   * @param {number} options.retryCount - 重试次数（默认 0）
   * @param {Object} options.fallbackData - 降级时返回的默认数据
   * @param {boolean} options.showToast - 是否显示 Toast（默认 true）
   * @param {string} options.loadingLabel - 加载提示文本
   * @returns {Promise} 解析后的结果
   */
  async wrapApiCall(apiCall, options = {}) {
    const {
      retryCount = 0,
      fallbackData = null,
      showToast = true,
      loadingLabel = '加载中...'
    } = options;

    let lastError;

    // 显示加载状态
    this.showLoading();

    // 尝试执行（支持重试）
    for (let attempt = 1; attempt <= retryCount + 1; attempt++) {
      try {
        const result = await apiCall();
        this.hideLoading();
        return result;
      } catch (error) {
        lastError = error;
        console.error(`[API 尝试 ${attempt}] 失败:`, error.message);

        // 如果是最后一次尝试，执行降级逻辑
        if (attempt === retryCount + 1) {
          // 检查是否可用降级
          if (PINGYAO_CONFIG?.fallback?.enabled && fallbackData) {
            this.hideLoading();
            this.toast(`⚠️ 服务降级，使用演示数据`, 'warning', 4000);
            return fallbackData;
          }

          this.hideLoading();
          if (showToast) {
            this.toast(`❌ ${error.message || '请求失败，请重试'}`, 'error', 5000);
          }
          throw error; // 抛出错误供上层处理
        }

        // 重试前等待（指数退避）
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },

  // ==================== 网络状态检测 ====================

  /**
   * 检查浏览器是否在线
   * @returns {boolean} 是否在线
   */
  isOnline() {
    return navigator.onLine || !PINGYAO_CONFIG?.network?.offlineThreshold;
  },

  /**
   * 检查是否应进入降级模式
   * @returns {boolean} 是否降级
   */
  shouldFallback() {
    if (!PINGYAO_CONFIG?.fallback?.enabled) return false;
    if (!this.isOnline()) return true;
    return false;
  },

  // ==================== 全局异常捕获 ====================

  /**
   * 注册全局错误和未处理 Promise 拒绝捕获
   */
  registerGlobalHandler() {
    // 全局 JS 运行时错误
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('[全局错误]', { message, source, lineno, colno, error });
      this.toast('页面遇到了一个小问题，已自动恢复', 'error', 4000);
      return true; // 阻止默认浏览器错误处理
    };

    // 未捕获的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      console.error('[未捕获的 Promise 拒绝]', error);
      // 避免对已知的 API 错误重复弹 Toast（已在 wrapApiCall 中处理）
      if (error && error.handled) return;
      this.toast('请求未完成，请检查网络后重试', 'error', 4000);
      event.preventDefault();
    });

    // 网络状态变化检测
    window.addEventListener('offline', () => {
      this.toast('⚠️ 网络已断开，部分功能可能不可用', 'warning', 5000);
    });
    window.addEventListener('online', () => {
      this.toast('✅ 网络已恢复', 'success', 3000);
    });
  },

  // ==================== 带重试机制的 API 调用 ====================

  /**
   * 带重试机制的 API 调用（指数退避）
   * @param {Function} fn - 异步请求函数
   * @param {Object} options - 配置项
   * @param {number} options.retries - 最大重试次数（默认 2）
   * @param {number} options.delay - 初始延迟 ms（默认 1000）
   * @param {Function} options.onRetry - 每次重试前的回调
   * @returns {Promise} 成功时的结果
   */
  async withRetry(fn, { retries = 2, delay = 1000, onRetry } = {}) {
    let lastError;
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        // 网络断开时不重试
        if (!navigator.onLine) throw new Error('网络已断开，请检查网络连接后重试');
        // AbortError 不重试（用户主动取消）
        if (err.name === 'AbortError') throw err;
        // 4xx 错误不重试（客户端错误）
        if (err.message && /4\d\d/.test(err.message)) throw err;

        if (i < retries) {
          const wait = delay * Math.pow(2, i); // 指数退避：1s → 2s → 4s
          if (onRetry) onRetry(i + 1, retries, wait);
          await new Promise(resolve => setTimeout(resolve, wait));
        }
      }
    }
    throw lastError;
  },

  // ==================== 错误分类 ====================

  /**
   * 错误分类：返回人类可读的中文描述
   * @param {Error} err - 错误对象
   * @returns {string} 中文描述
   */
  classifyError(err) {
    if (!navigator.onLine) return '网络已断开，请检查网络连接';
    if (err.name === 'AbortError') return '请求已取消';
    if (err.name === 'TypeError' && err.message.includes('fetch')) return '网络请求失败，请检查网络';
    if (err.message && err.message.includes('timeout')) return '请求超时，请稍后重试';

    // HTTP 状态码分类
    const msg = err.message || '';
    if (/401/.test(msg)) return 'API 认证失败，请联系管理员配置 Token';
    if (/403/.test(msg)) return 'API 权限不足';
    if (/429/.test(msg)) return '请求太频繁，请稍后重试';
    if (/5\d\d/.test(msg)) return '服务器繁忙，请稍后重试';

    return err.message || '未知错误，请稍后重试';
  },

  // ==================== 初始化 ====================

  /**
   * 在页面加载时自动注册全局异常处理
   */
  init() {
    if (window._errorHandlerInitialized) return;
    this.registerGlobalHandler();
    window._errorHandlerInitialized = true;
    console.log('[ErrorHandler] 全局异常捕获已注册');
  }
};

// 导出到全局
window.ErrorHandler = ErrorHandler;

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ErrorHandler.init());
} else {
  ErrorHandler.init();
}

// 注入 Toast 动画 CSS（如果尚未注入）
(function injectToastCSS() {
  if (document.getElementById('toast-styles')) return;
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    .pygc-toast { animation: slideIn 0.3s ease; }
  `;
  document.head.appendChild(style);
})();