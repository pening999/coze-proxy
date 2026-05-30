/**
 * 路线规划模块
 * 提供表单渲染、校验、AI 生成、结果展示功能
 */

const RoutePlanner = {
  /** 初始化路线规划表单 */
  initForm(formContainerId, resultContainerId) {
    const container = document.getElementById(formContainerId);
    if (!container) return;

    container.innerHTML = `
      <div class="route-form">
        <h3 class="route-form-title"><i class="fa-solid fa-route"></i> 个性化路线规划</h3>
        <p class="route-form-desc">告诉我您的偏好，AI 为您定制专属平遥之旅</p>
        
        <div id="form-errors" class="form-errors" style="display:none;"></div>

        <div class="form-group">
          <label class="form-label"><i class="fa-solid fa-clock"></i> 游玩时长</label>
          <div class="radio-group-horizontal">
            ${['半日', '一日', '两日', '三日及以上'].map(d => `
              <label class="radio-card ${d === '一日' ? 'active' : ''}" onclick="RoutePlanner.selectRadio(this, 'duration')">
                <input type="radio" name="duration" value="${d}" ${d === '一日' ? 'checked' : ''}>
                <span>${d}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label"><i class="fa-solid fa-heart"></i> 兴趣偏好（可多选）</label>
          <div class="checkbox-group">
            ${[
              { value: '历史', icon: 'landmark', label: '历史文化' },
              { value: '建筑', icon: 'building-columns', label: '古建探访' },
              { value: '美食', icon: 'utensils', label: '美食体验' },
              { value: '摄影', icon: 'camera', label: '摄影采风' },
              { value: '民俗', icon: 'mask', label: '民俗风情' },
              { value: '休闲', icon: 'leaf', label: '休闲漫步' }
            ].map(item => `
              <label class="checkbox-item">
                <input type="checkbox" name="interests" value="${item.value}" ${item.value === '历史' ? 'checked' : ''}>
                <i class="fa-solid fa-${item.icon}"></i>
                <span>${item.label}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label"><i class="fa-solid fa-users"></i> 同行人群</label>
          <div class="radio-group-horizontal">
            ${['独自', '情侣', '朋友', '亲子', '老人', '团体'].map(p => `
              <label class="radio-card" onclick="RoutePlanner.selectRadio(this, 'companions')">
                <input type="radio" name="companions" value="${p}">
                <span>${p}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label"><i class="fa-solid fa-wallet"></i> 预算</label>
            <select name="budget" class="form-select">
              <option value="经济">经济（500元以内）</option>
              <option value="适中" selected>适中（500-1000元）</option>
              <option value="舒适">舒适（1000-2000元）</option>
              <option value="豪华">豪华（2000元以上）</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fa-solid fa-person-walking"></i> 体力情况</label>
            <select name="fitness" class="form-select">
              <option value="轻松">轻松（不想太累）</option>
              <option value="适中" selected>适中（正常步行）</option>
              <option value="充沛">充沛（不怕走路）</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            <i class="fa-solid fa-camera"></i> 是否需要摄影建议
          </label>
          <div class="radio-group-horizontal">
            <label class="radio-card" onclick="RoutePlanner.selectRadio(this, 'photo')">
              <input type="radio" name="photo" value="是">
              <span>需要最佳机位推荐</span>
            </label>
            <label class="radio-card active" onclick="RoutePlanner.selectRadio(this, 'photo')">
              <input type="radio" name="photo" value="否" checked>
              <span>不需要</span>
            </label>
          </div>
        </div>

        <div class="button-group" style="margin-top: 25px;">
          <button class="action-btn" onclick="RoutePlanner.generateRoute()">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <span>AI 生成我的专属路线</span>
          </button>
          <button class="action-btn secondary" onclick="RoutePlanner.resetForm()">
            <i class="fa-solid fa-rotate-left"></i>
            <span>重置</span>
          </button>
        </div>
      </div>
    `;
  },

  /** 选择单选框 */
  selectRadio(el, groupName) {
    const parent = el.closest('.radio-group-horizontal');
    if (!parent) return;
    parent.querySelectorAll('.radio-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    const radio = el.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  },

  /** 重置表单 */
  resetForm() {
    const container = document.querySelector('.route-form');
    if (container) {
      this.initForm('route-form-container', 'route-result-container');
    }
  },

  /** 生成路线 */
  async generateRoute() {
    // 收集表单数据
    const durationEl = document.querySelector('input[name="duration"]:checked');
    const interestEls = document.querySelectorAll('input[name="interests"]:checked');
    const companionsEl = document.querySelector('input[name="companions"]:checked');
    const budgetEl = document.querySelector('select[name="budget"]');
    const fitnessEl = document.querySelector('select[name="fitness"]');
    const photoEl = document.querySelector('input[name="photo"]:checked');

    // 校验
    if (!durationEl) {
      ErrorHandler.toast('请选择游玩时长', 'error');
      return;
    }
    if (interestEls.length === 0) {
      ErrorHandler.toast('请至少选择一个兴趣偏好', 'error');
      return;
    }
    if (!companionsEl) {
      ErrorHandler.toast('请选择同行人群', 'error');
      return;
    }

    const preferences = {
      duration: durationEl.value,
      interests: Array.from(interestEls).map(el => el.value),
      companions: companionsEl ? companionsEl.value : '独自',
      budget: budgetEl ? budgetEl.value : '适中',
      fitness: fitnessEl ? fitnessEl.value : '适中',
      photo: photoEl ? photoEl.value : '否'
    };

    // 显示加载状态
    const loadingEl = document.getElementById('route-loading') || this._createLoading();
    loadingEl.style.display = 'flex';
    const resultContainer = document.getElementById('route-result-container');
    if (resultContainer) resultContainer.innerHTML = '';

    try {
      // 调用 Coze API 或使用模拟数据
      const result = await CozeClient.generateRoute(preferences);
      
      // 保存到历史记录
      StorageUtils.saveRoute(result);

      // 渲染结果
      this.renderResult(result, document.getElementById('route-result-container'));
    } catch (err) {
      ErrorHandler.toast('路线生成失败，请稍后重试', 'error');
    } finally {
      loadingEl.style.display = 'none';
    }
  },

  /** 创建加载指示器 */
  _createLoading() {
    const div = document.createElement('div');
    div.id = 'route-loading';
    div.className = 'loading-state';
    div.innerHTML = `
      <div class="spinner"></div>
      <div class="loading-text">
        AI 正在为您规划路线<span class="loading-dots"></span><br>
        <small style="color: #999; margin-top: 8px; display: block;">分析您的偏好中...</small>
      </div>
    `;
    const container = document.getElementById('route-result-container');
    if (container) container.parentNode.insertBefore(div, container);
    return div;
  },

  /** 渲染路线结果 */
  renderResult(result, container) {
    if (!container) return;

    // 保存当前结果引用，供"保存到我的路线"使用
    this._currentResult = result;

    container.innerHTML = `
      <div class="route-result-card">
        <div class="route-result-header">
          <div>
            <h3><i class="fa-solid fa-map"></i> ${result.title || '您的定制路线'}</h3>
            <p class="route-result-summary">${result.summary || ''}</p>
          </div>
          <div class="route-result-actions">
            <button class="icon-btn" onclick="RoutePlanner.saveCurrentRoute()" title="保存到我的路线"><i class="fa-regular fa-bookmark"></i> 保存</button>
            <button class="icon-btn" onclick="RoutePlanner.copyRoute()"><i class="fa-regular fa-copy"></i> 复制</button>
            <button class="icon-btn" onclick="RoutePlanner.regenerateRoute()"><i class="fa-solid fa-rotate"></i> 重新生成</button>
          </div>
        </div>

        <div class="route-timeline">
          ${(result.route || []).map((item, index) => `
            <div class="route-timeline-item">
              <div class="route-time-badge">${item.time || ''}</div>
              <div class="route-spot-card">
                <div class="route-spot-number">${index + 1}</div>
                <div class="route-spot-info">
                  <h4>${item.spot || ''}</h4>
                  <p class="route-spot-reason">${item.reason || ''}</p>
                  ${item.tips ? `<p class="route-spot-tips"><i class="fa-solid fa-lightbulb"></i> ${item.tips}</p>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        ${result.food && result.food.length > 0 ? `
          <div class="route-food-section">
            <h4><i class="fa-solid fa-utensils"></i> 美食推荐</h4>
            <div class="route-food-tags">
              ${result.food.map(f => `<span class="route-food-tag">${f}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${result.notice ? `
          <div class="route-notice">
            <i class="fa-solid fa-triangle-exclamation"></i> ${result.notice}
          </div>
        ` : ''}

        <div class="route-footer">
          <p class="route-disclaimer">⚠️ 路线由 AI 根据您的偏好生成，建议出行前核实景点开放时间和票价。</p>
        </div>
      </div>
    `;
  },

  /** 复制路线文本 */
  copyRoute() {
    const resultEl = document.querySelector('.route-result-card');
    if (!resultEl) return;
    
    const text = resultEl.textContent.replace(/\s+/g, ' ').trim();
    navigator.clipboard.writeText(text).then(() => {
      ErrorHandler.toast('路线已复制到剪贴板', 'success');
    }).catch(() => {
      ErrorHandler.toast('复制失败，请手动选择复制', 'error');
    });
  },

  /** 重新生成路线 */
  async regenerateRoute() {
    await this.generateRoute();
  },

  /** 保存当前路线到我的路线 */
  saveCurrentRoute() {
    if (!this._currentResult) {
      ErrorHandler.toast('没有可保存的路线', 'error');
      return;
    }
    const saved = StorageUtils.saveRoute(this._currentResult);
    if (saved) {
      ErrorHandler.toast('✅ 路线已保存到「我的路线」', 'success');
    } else {
      ErrorHandler.toast('保存失败，请稍后重试', 'error');
    }
  }
};

// 导出到全局
window.RoutePlanner = RoutePlanner;
