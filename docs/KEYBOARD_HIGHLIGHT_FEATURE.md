# 键盘按键高亮功能

## 功能说明

在录制视频时，当用户按下键盘按键，会在屏幕左下角以精美的磨玻璃效果显示按键名称，方便观众了解操作者按下了哪些键。

## 功能特点

1. **实时显示**：按键按下时立即在左下角显示
2. **多键显示**：最多同时显示 5 个按键
3. **自动淡出**：按键显示 1.5 秒后开始淡出，2 秒后完全消失
4. **磨玻璃效果**：使用现代化的磨玻璃（Glassmorphism）设计风格
5. **美观设计**：
   - 半透明黑色背景容器，带有 20px 模糊效果
   - 白色半透明按键徽章，带有 10px 模糊效果
   - 柔和的阴影和高光效果
   - 流畅的弹性动画
6. **不干扰操作**：覆盖层完全穿透，不影响任何操作
7. **响应式设计**：在不同屏幕尺寸下自适应显示

## 使用方法

1. 启动应用
2. 开始录制（全屏录制或区域录制）
3. 按下键盘按键
4. 在屏幕左下角会看到按键名称显示
5. 停止录制，查看视频确认效果

## 支持的按键

- 所有字母键（A-Z）
- 所有数字键（0-9）
- 功能键（F1-F12）
- 修饰键（Ctrl、Shift、Alt、Win）
- 特殊键（Enter、Backspace、Tab、Space、Esc 等）
- 方向键（↑、↓、←、→）
- 数字小键盘（Num 0-9、Num +、Num - 等）
- 其他常用键（Home、End、Page Up、Page Down、Insert、Delete 等）

## 技术实现

- 使用 `uiohook-napi` 捕获系统级键盘事件
- 创建独立的键盘覆盖层窗口显示在左下角
- 通过 IPC 通信将按键事件从主进程传递到渲染进程
- 使用 Vue 3 和 shadcn/vue Badge 组件实现美观的 UI
- 使用 CSS backdrop-filter 实现磨玻璃效果
- 使用 CSS 动画实现流畅的弹性动画效果
- **完全透明窗口**：窗口背景完全透明，不影响点击穿透
- **点击穿透**：设置 `setIgnoreMouseEvents(true, { forward: true })` 确保不阻止任何操作

## UI 设计特点

### 磨玻璃效果（Glassmorphism）
- **容器背景**：`rgba(0, 0, 0, 0.4)` + `backdrop-filter: blur(20px)`
- **按键徽章**：`rgba(255, 255, 255, 0.15)` + `backdrop-filter: blur(10px)`
- **边框**：半透明白色边框增强玻璃质感
- **阴影**：多层阴影营造深度感

### 动画效果
- **进入动画**：从下方弹出，带有缩放和回弹效果
- **离开动画**：向上淡出，带有轻微缩放
- **过渡效果**：使用 cubic-bezier 缓动函数实现自然流畅的动画

## 自定义选项

可以通过修改以下文件来自定义显示效果：

### 位置调整
文件：`src/main/win/keyboardOverlayWin.ts`
```typescript
const x = 20;  // 距离左边的距离
const y = screenHeight - height - 80;  // 距离底部的距离
```

### 容器样式调整
文件：`src/renderer/src/pages/keyboardOverlay/App.vue`
```css
.keyboard-display-container {
  background: rgba(0, 0, 0, 0.4);  /* 容器背景颜色 */
  backdrop-filter: blur(20px);      /* 模糊程度 */
  border-radius: 16px;              /* 圆角大小 */
  padding: 16px 20px;               /* 内边距 */
}
```

### 按键徽章样式调整
文件：`src/renderer/src/pages/keyboardOverlay/App.vue`
```css
.key-badge {
  background: rgba(255, 255, 255, 0.15) !important;  /* 徽章背景 */
  backdrop-filter: blur(10px);                        /* 模糊程度 */
  color: #ffffff !important;                          /* 文字颜色 */
  font-size: 18px !important;                         /* 字体大小 */
  padding: 10px 20px !important;                      /* 内边距 */
  border-radius: 10px !important;                     /* 圆角 */
}
```

### 显示数量
文件：`src/renderer/src/pages/keyboardOverlay/App.vue`
```typescript
if (displayedKeys.value.length > 5) {  // 修改这个数字
  displayedKeys.value.shift();
}
```

### 显示时长
文件：`src/renderer/src/pages/keyboardOverlay/App.vue`
```typescript
setTimeout(() => {
  // 开始淡出
}, 1500);  // 修改这个数字（毫秒）

setTimeout(() => {
  // 完全移除
}, 2000);  // 修改这个数字（毫秒）
```

### 动画效果调整
文件：`src/renderer/src/pages/keyboardOverlay/App.vue`
```css
@keyframes key-enter {
  0% {
    transform: translateY(30px) scale(0.7);  /* 起始位置和缩放 */
    opacity: 0;
  }
  50% {
    transform: translateY(-5px) scale(1.05); /* 回弹效果 */
  }
  100% {
    transform: translateY(0) scale(1);       /* 最终状态 */
    opacity: 1;
  }
}
```

## 注意事项

1. 需要安装 `uiohook-napi` 依赖
2. 仅在录制时启用，不录制时不会显示
3. 覆盖层窗口完全穿透，不会阻止任何操作
4. 支持 Windows、macOS、Linux 系统
5. 磨玻璃效果在某些旧版浏览器可能不支持
6. 使用了 shadcn/vue Badge 组件，确保已正确安装

## 浏览器兼容性

磨玻璃效果使用了 `backdrop-filter` CSS 属性，兼容性如下：
- Chrome/Edge 76+
- Safari 9+
- Firefox 103+

对于不支持的浏览器，会降级为纯色背景显示。
