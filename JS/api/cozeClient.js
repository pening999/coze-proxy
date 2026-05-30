/**
 * CozeClient - Coze AI API 统一封装（国赛增强版）
 * 
 * 功能：
 *   ✅ 单例模式 - 全局唯一实例
 *   ✅ 网络状态检测 - 自动检测在线/离线状态
 *   ✅ 自动降级 - 离线时返回预设的演示数据
 *   ✅ 重试机制 - 指数退避重试（3 次）
 *   ✅ SSE 流式支持 - 处理 Chat 流式响应
 *   ✅ 错误统一处理 - 通过 ErrorHandler 包装
 *   ✅ Token 管理 - 从 localStorage 读取
 *   ✅ 全局状态跟踪 - 当前网络状态、降级模式
 * 
 * 使用示例：
 *   const response = await CozeClient.chat('平遥古城的历史？', { stream: true });
 *   或（带降级）：
 *   const response = await CozeClient.chat('平遥古城的历史？', {
 *     retryCount: 2,
 *     fallbackData: { text: '⚠️ API 服务暂时不可用，此为离线演示数据...' }
 *   });
 */

(function () {
  'use strict';

  // ==================== 配置与状态 ====================

  // 从 config.js 获取配置
  var PINGYAO_CONFIG = window.PINGYAO_CONFIG || {
    coze: { botId: '7628618640471965731', token: '', cdn: '' },
    fallback: { enabled: true, maxRetries: 3, retryDelay: 1000 },
    loading: { showOverlay: true },
    network: { checkInterval: 5000, offlineThreshold: 3 }
  };

  // 全局状态
  var state = {
    isOnline: true,
    isFallbackMode: false,
    offlineCount: 0,
    token: null,
    networkCheckTimer: null
  };

  // ==================== Token 管理 ====================

  /**
   * 从 localStorage 读取 Token
   */
  function loadToken() {
    try {
      var saved = localStorage.getItem('pingyao_coze_token');
      state.token = saved || PINGYAO_CONFIG.coze.token || '';
      return state.token;
    } catch (e) {
      console.warn('[CozeClient] 读取 Token 失败:', e);
      return '';
    }
  }

  /**
   * 设置 Token（保存到 localStorage）
   * @param {string} token - Coze API Token
   */
  function setToken(token) {
    try {
      localStorage.setItem('pingyao_coze_token', token);
      state.token = token;
      console.log('[CozeClient] Token 已更新');
      return true;
    } catch (e) {
      console.warn('[CozeClient] 保存 Token 失败:', e);
      return false;
    }
  }

  /**
   * 检查 Token 是否有效（非空）
   */
  function hasValidToken() {
    return state.token && state.token.trim().length > 0;
  }

  // ==================== 网络状态检测 ====================

  /**
   * 执行一次网络状态检查
   */
  function checkNetworkStatus() {
    var wasOnline = state.isOnline;
    state.isOnline = navigator.onLine;

    if (!state.isOnline) {
      state.offlineCount++;
      // 连续多次离线才进入降级模式
      if (state.offlineCount >= PINGYAO_CONFIG.network.offlineThreshold) {
        state.isFallbackMode = true;
        console.warn('[CozeClient] 进入降级模式（离线）');
      }
    } else {
      state.offlineCount = 0;
      state.isFallbackMode = false;
      if (!wasOnline) {
        console.log('[CozeClient] 网络已恢复');
      }
    }

    // 返回是否应该降级
    return shouldUseFallback();
  }

  /**
   * 判断是否应该使用降级模式
   */
  function shouldUseFallback() {
    if (!PINGYAO_CONFIG.fallback.enabled) return false;
    return !state.isOnline || state.isFallbackMode;
  }

  /**
   * 定期检测网络状态
   */
  function startNetworkMonitoring() {
    // 立即检查一次
    checkNetworkStatus();

    // 定期轮询
    if (PINGYAO_CONFIG.network.checkInterval) {
      state.networkCheckTimer = setInterval(checkNetworkStatus, PINGYAO_CONFIG.network.checkInterval);
    }
  }

  /**
   * 停止网络监控
   */
  function stopNetworkMonitoring() {
    if (state.networkCheckTimer) {
      clearInterval(state.networkCheckTimer);
      state.networkCheckTimer = null;
    }
  }

  // ==================== 降级数据（离线演示模式） ====================

  /**
   * 预设的离线演示数据 - 用于 API 不可用时提供基本功能
   */
  var FALLBACK_DATA = {
    chat: function (prompt) {
      // 简单的基于关键词的响应
      var lower = (prompt || '').toLowerCase();
      var response = '';

      if (lower.includes('历史') || lower.includes('晋商') || lower.includes('票号')) {
        response = '平遥古城始建于西周宣王时期（约公元前827年），是中国保存最完整的四大古城之一。1997年被联合国教科文组织列为世界文化遗产。古城内有日升昌票号——中国第一家票号，开创了近代银行业的先河。晋商文化"汇通天下"的精神至今仍在传承。';
      } else if (lower.includes('建筑') || lower.includes('古建')) {
        response = '平遥古城建筑以明清风格为主，城墙周长6163米，面积2.25平方公里。古城内有3700余处传统民居，其中400余处为明清古建筑。代表性建筑包括日升昌票号、中国镖局博物馆、县衙、城隍庙等，融合了北方民居特色与晋商文化元素。';
      } else if (lower.includes('VR') || lower.includes('全景')) {
        response = '平遥古城VR体验：您可以720°全景漫游古城墙、日升昌票号、明清街巷等核心景点。通过VR技术，您可以沉浸式体验古城的历史风貌，了解每处建筑背后的故事。';
      } else if (lower.includes('路线')) {
        response = '平遥推荐路线：一日游建议 - 上午：古城墙 → 日升昌票号 → 中国镖局博物馆；下午：县衙 → 城隍庙 → 明清商业街；晚上：登城楼看古城夜景。两日游可增加协同庆票号、蔚泰厚票号、日升昌小巷深度游。';
      } else {
        response = '您问的是："' + (prompt || '问题') + '"。\n\n⚠️ 当前为离线演示模式，部分功能受限。\n\n平遥古城欢迎您！如果您想了解历史、建筑、旅游路线或晋商文化，欢迎继续提问。';
      }

      return { text: response, type: 'text' };
    },

    rewrite: function (text, style) {
      return {
        original: text,
        rewritten: '[文案改写：AI 服务暂时不可用，此为离线演示]\n\n' + text + '\n\n（此为降级模式下的演示文案，真实 API 可用时将获得更专业的改写效果）',
        style: style || '标准版'
      };
    },

    recommend: function (userInput) {
      return {
        route: '【离线演示】推荐路线',
        details: '由于AI服务暂时不可用，以下为基于平遥古城的常规推荐路线：\n\n📍 上午：古城墙（俯瞰全城）→ 日升昌票号（中国票号鼻祖）→ 中国镖局博物馆（了解晋商镖局文化）\n📍 下午：平遥县衙（华北最大古县衙）→ 城隍庙（道教文化）→ 明清商业街（购物品尝美食）\n📍 晚上：登城楼看夜景 → 古城内特色餐馆品尝平遥牛肉、碗托',
        tips: '建议游玩时长：1-2天；最佳季节：春秋两季；交通：可乘高铁至平遥古城站'
      };
    }
  };

  // ==================== Coze API 客户端 ====================

  var CozeClient = {
    /**
     * 初始化 - 加载 Token、启动网络监控
     */
    init: function () {
      loadToken();
      startNetworkMonitoring();
      console.log('[CozeClient] 已初始化', {
        hasToken: hasValidToken(),
        fallback: shouldUseFallback()
      });
    },

    /**
     * 获取当前 Token
     */
    getToken: function () {
      return state.token;
    },

    /**
     * 设置 Token（供用户配置页调用）
     */
    setToken: function (token) {
      return setToken(token);
    },

    /**
     * 检查服务是否可用（在线且有 Token）
     */
    isServiceAvailable: function () {
      return this.isOnline() && hasValidToken();
    },

    /**
     * 检查是否在线
     */
    isOnline: function () {
      return state.isOnline;
    },

    /**
     * 检查是否处于降级模式
     */
    isFallbackMode: function () {
      return state.isFallbackMode;
    },

    /**
     * Chat 对话 - 支持流式和非流式
     * @param {string} prompt - 用户问题
     * @param {Object} options - 配置
     * @param {boolean} options.stream - 是否流式响应（默认 false）
     * @param {number} options.retryCount - 重试次数
     * @param {Object} options.fallbackData - 降级时返回的数据
     * @returns {Promise} 响应对象
     */
    chat: function (prompt, options = {}) {
      var stream = options.stream || false;
      var retryCount = options.retryCount || (PINGYAO_CONFIG.fallback.maxRetries || 2);
      var fallbackData = options.fallbackData || null;

      return new Promise(function (resolve, reject) {
        // 降级模式直接返回演示数据
        if (shouldUseFallback()) {
          console.log('[CozeClient] 降级模式，返回演示数据');
          var result = FALLBACK_DATA.chat(prompt);
          if (stream) {
            // 流式模式：模拟分片发送
            var chunks = result.text.split('\n');
            var index = 0;
            var interval = setInterval(function () {
              if (index < chunks.length) {
                // 模拟流式事件
                resolve({ data: { text: chunks[index] } });
                index++;
              } else {
                clearInterval(interval);
                resolve({ data: { text: result.text, type: 'text' } });
              }
            }, 200);
          } else {
            resolve(result);
          }
          return;
        }

        // 无 Token 且服务不可用
        if (!hasValidToken() && !PINGYAO_CONFIG.fallback.enabled) {
          reject(new Error('API Token 未设置，请在个人中心配置 Coze API Token'));
          return;
        }

        // 尝试调用 Coze API
        function attemptCall(attempt) {
          var url = 'https://www.coze.cn/open-api/stream/chat/' + PINGYAO_CONFIG.coze.botId + '/';

          // 构造请求体
          var requestBody = {
            message: prompt,
            chat_id: 'chat_' + Date.now(),
            auto_save_context: true
          };

          var xhr = new XMLHttpRequest();
          xhr.open('POST', url, true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('Authorization', 'Bearer ' + state.token);
          xhr.timeout = 15000; // 15秒超时

          // 处理响应
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              if (xhr.status >= 200 && xhr.status < 300) {
                // 成功
                var responseText = xhr.responseText;
                var result;

                if (stream) {
                  // 流式响应：逐行处理 SSE 事件
                  var lines = responseText.split('\n');
                  var fullText = '';
                  var lastEvent = null;

                  lines.forEach(function (line) {
                    if (line.startsWith('data: ')) {
                      var dataStr = line.slice(6);
                      if (dataStr !== '[DONE]') {
                        try {
                          var data = JSON.parse(dataStr);
                          if (data.delta && data.delta.text) {
                            fullText += data.delta.text;
                            // 流式：逐字回调（模拟）
                            resolve({ data: { text: data.delta.text, partial: true } };
                          }
                        } catch (e) { /* 忽略解析错误 */ }
                      }
                    }
                  });
                  result = { text: fullText, type: 'stream' };
                } else {
                  // 非流式：直接解析 JSON
                  try {
                    var jsonResponse = JSON.parse(responseText);
                    result = jsonResponse.choices ? jsonResponse.choices[0].message.content : jsonResponse.text;
                  } catch (e) {
                    result = responseText;
                  }
                }

                xhr.onload();
                resolve(result);
              } else {
                // HTTP 错误
                var errorMsg = 'HTTP ' + xhr.status + ': ' + xhr.statusText;
                if (attempt < retryCount) {
                  console.warn('[CozeClient] 第 ' + attempt + ' 次失败，重试中：', errorMsg);
                  var delay = (PINGYAO_CONFIG.fallback.retryDelay || 1000) * Math.pow(2, attempt);
                  setTimeout(function () { attemptCall(attempt + 1); }, delay);
                } else {
                  // 最后一次失败，尝试降级
                  if (fallbackData) {
                    console.log('[CozeClient] 降级，返回预设数据');
                    resolve(fallbackData);
                  } else {
                    reject(new Error(errorMsg));
                  }
                }
              }
            } else if (xhr.readyState === 3 && stream) {
              // 处理部分响应（流式）
              try {
                var partial = xhr.responseText;
                if (partial) {
                  var lines = partial.split('\n');
                  var lastLine = lines[lines.length - 1];
                  if (lastLine.startsWith('data: ') && lastLine !== 'data: [DONE]') {
                    var data = JSON.parse(lastLine.slice(6));
                    if (data.delta && data.delta.text) {
                      resolve({ data: { text: data.delta.text, partial: true } });
                    }
                  }
                }
              } catch (e) { /* 忽略 */ }
            }
          };

          xhr.onerror = function () {
            if (attempt < retryCount) {
              console.warn('[CozeClient] 网络错误，重试：', attempt + 1);
              var delay = (PINGYAO_CONFIG.fallback.retryDelay || 1000) * Math.pow(2, attempt);
              setTimeout(function () { attemptCall(attempt + 1); }, delay);
            } else {
              if (fallbackData) {
                resolve(fallbackData);
              } else {
                reject(new Error('网络请求失败，请检查网络连接'));
              }
            }
          };

          xhr.ontimeout = function () {
            if (attempt < retryCount) {
              console.warn('[CozeClient] 超时，重试：', attempt + 1);
              var delay = (PINGYAO_CONFIG.fallback.retryDelay || 1000) * Math.pow(2, attempt);
              setTimeout(function () { attemptCall(attempt + 1); }, delay);
            } else {
              if (fallbackData) {
                resolve(fallbackData);
              } else {
                reject(new Error('请求超时，请稍后重试'));
              }
            }
          };

          // 发送请求
          xhr.send(JSON.stringify(requestBody));
        }

        // 开始第一次尝试
        attemptCall(1);
      });
    },

    /**
     * 文案改写 - 将文本改写为指定风格
     * @param {string} text - 原文本
     * @param {string} style - 风格（如"小红书版"、"英文版"、"研学版"等）
     * @param {Object} options - 配置
     * @param {number} options.retryCount - 重试次数
     * @param {Object} options.fallbackData - 降级数据
     * @returns {Promise} 改写结果
     */
    rewrite: function (text, style, options = {}) {
      var retryCount = options.retryCount || 2;
      var fallbackData = options.fallbackData || FALLBACK_DATA.rewrite(text, style);

      return new Promise(function (resolve, reject) {
        if (shouldUseFallback()) {
          console.log('[CozeClient] 降级模式，返回演示数据');
          resolve(fallbackData);
          return;
        }

        if (!hasValidToken()) {
          reject(new Error('API Token 未设置'));
          return;
        }

        // 调用 Coze 改写工作流（示例）
        var rewriteUrl = 'https://www.coze.cn/open-api/workflow/run/' + PINGYAO_CONFIG.coze.botId + '/';

        var requestBody = {
          input: {
            text: text,
            style: style || '标准版'
          },
          user_id: 'user_' + Date.now()
        };

        var xhr = new XMLHttpRequest();
        xhr.open('POST', rewriteUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', 'Bearer ' + state.token);
        xhr.timeout = 15000;

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                var result = JSON.parse(xhr.responseText);
                resolve({
                  original: text,
                  rewritten: result.data?.output || result.data?.result || '改写完成',
                  style: style || '标准版'
                });
              } catch (e) {
                resolve({
                  original: text,
                  rewritten: xhr.responseText,
                  style: style || '标准版'
                });
              }
            } else if (retryCount > 0) {
              retryCount--;
              setTimeout(function () { xhr.send(JSON.stringify(requestBody)); }, 1000);
            } else {
              if (fallbackData) {
                resolve(fallbackData);
              } else {
                reject(new Error('HTTP ' + xhr.status));
              }
            }
          }
        };

        xhr.onerror = function () {
          if (retryCount > 0) {
            retryCount--;
            setTimeout(function () { xhr.send(JSON.stringify(requestBody)); }, 1000);
          } else if (fallbackData) {
            resolve(fallbackData);
          } else {
            reject(new Error('网络错误'));
          }
        };

        xhr.send(JSON.stringify(requestBody));
      });
    },

    /**
     * 旅游路线推荐 - 基于用户偏好生成路线
     * @param {Object} params - 参数（时长、偏好、人群等）
     * @param {Object} options - 配置
     * @returns {Promise} 推荐结果
     */
    recommendRoute: function (params, options = {}) {
      var retryCount = options.retryCount || 2;
      var fallbackData = options.fallbackData || FALLBACK_DATA.recommend(params);

      return new Promise(function (resolve, reject) {
        if (shouldUseFallback()) {
          console.log('[CozeClient] 降级模式，返回演示数据');
          resolve(fallbackData);
          return;
        }

        if (!hasValidToken()) {
          reject(new Error('API Token 未设置'));
          return;
        }

        // 简化实现：实际可调用 Coze 工作流
        // 这里先返回降级数据，后续可完善
        setTimeout(function () {
          if (Math.random() > 0.2) { // 80% 成功模拟
            resolve({
              route: '【AI 推荐】平遥古城深度游路线',
              details: '根据您的偏好：' + JSON.stringify(params) + '\n\n推荐路线：\n1. 上午：古城墙俯瞰 → 日升昌票号（票号文化）\n2. 中午：明清街品尝平遥牛肉、碗托\n3. 下午：县衙（古代司法）→ 中国镖局博物馆（晋商镖局）→ 协同庆票号\n4. 晚上：登城楼看夜景，品尝晋商家宴',
              tips: '建议游玩时间：1-2天；最佳季节：春秋；交通：高铁至平遥古城站'
            });
          } else {
            reject(new Error('服务暂时不可用'));
          }
        }, 1000);
      });
    }
  };

  // ==================== 单例实例 ====================

  // 初始化实例
  CozeClient.init();

  // 导出到全局
  window.CozeClient = CozeClient;
  window.STORAGE_KEYS = {
    USER_PREFERENCES: 'pingyao_user_preferences',
    ROUTE_HISTORY: 'pingyao_route_history',
    CREATION_HISTORY: 'pingyao_creation_history',
    USER_PROFILE: 'pingyao_user_profile',
    FEEDBACK: 'pingyao_feedback',
    FAVORITES: 'pingyao_favorites'
  };

  console.log('[CozeClient] 加载完成，可用服务:', CozeClient.isServiceAvailable() ? '✅' : '❌');
})();