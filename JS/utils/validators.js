/**
 * 表单校验与通用校验工具
 */

const Validators = {
  /** 检查是否为空（去除首尾空格） */
  isEmpty(value) {
    return !value || value.trim() === '';
  },

  /** 校验用户名：3-20位，字母数字下划线中文 */
  isValidUsername(username) {
    return /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/.test(username);
  },

  /** 校验密码：6-20位 */
  isValidPassword(password) {
    return password.length >= 6 && password.length <= 20;
  },

  /** 校验邮箱格式 */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /** 校验手机号（中国大陆） */
  isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },

  /** 校验游玩时长输入 */
  isValidDuration(duration) {
    const validValues = ['半日', '一日', '两日', '三日及以上'];
    return validValues.includes(duration);
  },

  /** 校验兴趣偏好（至少选1项） */
  hasInterest(interests) {
    return Array.isArray(interests) && interests.length > 0;
  },

  /** 表单通用校验：返回 { valid, errors } */
  validate(formRules) {
    const errors = {};
    let valid = true;

    formRules.forEach(rule => {
      const { field, label, value, rules = [] } = rule;
      for (const r of rules) {
        if (r.required && this.isEmpty(value)) {
          errors[field] = `${label}不能为空`;
          valid = false;
          break;
        }
        if (r.minLength && value.length < r.minLength) {
          errors[field] = `${label}至少需要${r.minLength}个字符`;
          valid = false;
          break;
        }
        if (r.maxLength && value.length > r.maxLength) {
          errors[field] = `${label}不能超过${r.maxLength}个字符`;
          valid = false;
          break;
        }
        if (r.pattern && !r.pattern.test(value)) {
          errors[field] = r.message || `${label}格式不正确`;
          valid = false;
          break;
        }
        if (r.custom && !r.custom(value)) {
          errors[field] = r.message || `${label}不合法`;
          valid = false;
          break;
        }
      }
    });

    return { valid, errors };
  },

  /** 显示校验错误 */
  showErrors(errors, containerId = 'form-errors') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const errorList = Object.values(errors);
    if (errorList.length === 0) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    container.style.display = 'block';
    container.innerHTML = errorList.map(msg =>
      `<div class="form-error-item"><i class="fa-solid fa-circle-exclamation"></i> ${msg}</div>`
    ).join('');
  },

  /** 清空校验错误 */
  clearErrors(containerId = 'form-errors') {
    const container = document.getElementById(containerId);
    if (container) {
      container.style.display = 'none';
      container.innerHTML = '';
    }
  }
};

// 导出到全局
window.Validators = Validators;
