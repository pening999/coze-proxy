/**
 * API 模块统一导出
 * 使用方式（在 HTML 中按顺序加载）：
 *   <script src="js/utils/storage.js"></script>
 *   <script src="js/utils/validators.js"></script>
 *   <script src="js/utils/errorHandler.js"></script>
 *   <script src="config.js"></script>
 *   <script src="js/api/cozeClient.js"></script>
 *   <script src="js/api/index.js"></script>
 * 
 * 所有模块通过 window 全局对象导出：
 *   - window.CozeClient      → API 调用
 *   - window.ErrorHandler    → 错误处理与 Toast
 *   - window.StorageUtils    → localStorage 封装
 *   - window.Validators      → 表单校验
 *   - window.PINGYAO_CONFIG  → 全局配置
 *   - window.STORAGE_KEYS    → 存储键名常量
 */

// 确保所有依赖模块已加载
(function () {
  const required = [
    { name: 'CozeClient', obj: window.CozeClient },
    { name: 'ErrorHandler', obj: window.ErrorHandler },
    { name: 'StorageUtils', obj: window.StorageUtils },
    { name: 'Validators', obj: window.Validators },
    { name: 'PINGYAO_CONFIG', obj: window.PINGYAO_CONFIG },
  ];

  const missing = required.filter(m => !m.obj).map(m => m.name);
  if (missing.length > 0) {
    console.warn('[API] 以下模块未加载:', missing.join(', '));
    console.warn('[API] 请确保 HTML 中正确引入了对应的 script 标签');
  } else {
    console.log('[API] 所有模块加载完成 ✓');
  }
})();
