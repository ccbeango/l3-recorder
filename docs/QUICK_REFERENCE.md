# 键盘按键显示 - 快速参考

## 快速调整指南

### 修改位置
📁 `src/main/win/keyboardOverlayWin.ts`
```typescript
const x = 20;  // 左边距
const y = screenHeight - height - 80;  // 底边距
```

### 修改颜色
📁 `src/renderer/src/pages/keyboardOverlay/App.vue`
```css
/* 容器背景 */
.keyboard-display-container {
  background: rgba(0, 0, 0, 0.4);  /* 黑色 40% */
}

/* 按键背景 */
.key-badge {
  background: rgba(255, 255, 255, 0.15) !important;  /* 白色 15% */
  color: #ffffff !important;  /* 文字颜色 */
}
```

### 修改模糊程度
📁 `src/renderer/src/pages/keyboardOverlay/App.vue`
```css
/* 容器模糊 */
.keyboard-display-container {
  backdrop-filter: blur(20px);  /* 20px 模糊 */
}

/* 按键模糊 */
.key-badge {
  backdrop-filter: blur(10px);  /* 10px 模糊 */
}
```

### 修改字体大小
📁 `src/renderer/src/pages/keyboardOverlay/App.vue`
```css
.key-badge {
  font-size: 18px !important;  /* 字体大小 */
  font-weight: 600 !important;  /* 字体粗细 */
}
```

### 修改显示数量
📁 `src/renderer/src/pages/keyboardOverlay/App.vue`
```typescript
if (displayedKeys.value.length > 5) {  // 最多 5 个
  displayedKeys.value.shift();
}
```

### 修改显示时长
📁 `src/renderer/src/pages/keyboardOverlay/App.vue`
```typescript
setTimeout(() => {
  // 开始淡出
}, 1500);  // 1.5 秒后淡出

setTimeout(() => {
  // 完全移除
}, 2000);  // 2 秒后移除
```

### 修改动画速度
📁 `src/renderer/src/pages/keyboardOverlay/App.vue`
```css
.key-fade-enter-active {
  animation: key-enter 0.4s;  /* 进入动画 0.4 秒 */
}

.key-fade-leave-active {
  animation: key-leave 0.5s;  /* 离开动画 0.5 秒 */
}
```

### 修改圆角
📁 `src/renderer/src/pages/keyboardOverlay/App.vue`
```css
.keyboard-display-container {
  border-radius: 16px;  /* 容器圆角 */
}

.key-badge {
  border-radius: 10px !important;  /* 按键圆角 */
}
```

### 修改间距
📁 `src/renderer/src/pages/keyboardOverlay/App.vue`
```css
.keyboard-display-container {
  gap: 10px;  /* 按键之间的间距 */
  padding: 16px 20px;  /* 容器内边距 */
}

.key-badge {
  padding: 10px 20px !important;  /* 按键内边距 */
}
```

## 常见问题

### Q: 如何禁用磨玻璃效果？
A: 移除 `backdrop-filter` 属性，增加背景不透明度：
```css
.keyboard-display-container {
  background: rgba(0, 0, 0, 0.85);  /* 增加不透明度 */
  /* backdrop-filter: blur(20px); */  /* 注释掉 */
}
```

### Q: 如何改变显示位置到右下角？
A: 修改 `keyboardOverlayWin.ts`：
```typescript
const x = screenWidth - width - 20;  // 右边距
const y = screenHeight - height - 80;  // 底边距
```

### Q: 如何让按键显示更大？
A: 增加字体大小和内边距：
```css
.key-badge {
  font-size: 24px !important;
  padding: 14px 28px !important;
}
```

### Q: 如何改变动画效果？
A: 修改 `@keyframes` 规则：
```css
@keyframes key-enter {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
```

## 预设配置

### 极简风格
```css
.keyboard-display-container {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.key-badge {
  background: rgba(255, 255, 255, 0.1) !important;
  border: none !important;
  font-size: 16px !important;
}
```

### 高对比度
```css
.keyboard-display-container {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: none;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.key-badge {
  background: rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: none;
  font-size: 20px !important;
  font-weight: 700 !important;
}
```

### 彩色风格
```css
.key-badge {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3)) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}
```

## 调试技巧

### 查看覆盖层窗口
1. 开始录制
2. 打开主进程控制台
3. 查找 `[GlobalKeyboardListener]` 日志

### 测试按键映射
按下按键后，控制台会显示：
```
[GlobalKeyboardListener] Key pressed: Enter 28
```

### 检查动画
在浏览器开发者工具中：
1. 打开 Elements 面板
2. 找到 `.key-badge` 元素
3. 观察动画效果

## 性能监控

### 检查 FPS
```javascript
let lastTime = performance.now();
let frames = 0;

function checkFPS() {
  frames++;
  const now = performance.now();
  if (now >= lastTime + 1000) {
    console.log(`FPS: ${frames}`);
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(checkFPS);
}

checkFPS();
```

### 检查内存
```javascript
console.log('Keys displayed:', displayedKeys.value.length);
```

## 相关文档

- 📖 [功能说明](./KEYBOARD_HIGHLIGHT_FEATURE.md)
- 🎨 [UI 设计详解](./KEYBOARD_UI_DESIGN.md)
- 📝 [实现总结](./KEYBOARD_OVERLAY_SUMMARY.md)
- 🔧 [实现文档](./UIOHOOK_IMPLEMENTATION.md)
