# 使用 uiohook-napi 实现全局鼠标点击和键盘按键高亮

## 实现方案

使用 `uiohook-napi` 原生模块实现真正的全局鼠标和键盘监听，可以捕获系统级别的鼠标点击和键盘按键事件。

## 工作原理

### 鼠标点击高亮
```
用户点击桌面任意位置
  ↓
uiohook-napi 捕获系统级鼠标事件
  ↓
globalMouseListener 接收事件
  ↓
通过 IPC 发送到鼠标覆盖层窗口
  ↓
覆盖层显示波纹动画
  ↓
效果被录制到视频中
```

### 键盘按键高亮
```
用户按下键盘按键
  ↓
uiohook-napi 捕获系统级键盘事件
  ↓
globalMouseListener 接收事件并映射按键名称
  ↓
通过 IPC 发送到键盘覆盖层窗口
  ↓
覆盖层在左下角显示按键名称
  ↓
效果被录制到视频中
```

## 文件结构

### 主进程
- `src/main/globalMouseListener.ts` - 全局鼠标和键盘监听器（使用 uiohook-napi）
- `src/main/win/mouseClickOverlayWin.ts` - 鼠标点击覆盖层窗口类
- `src/main/win/keyboardOverlayWin.ts` - 键盘按键覆盖层窗口类
- `src/main/ipcMain.ts` - IPC 通信处理

### 渲染进程
- `src/renderer/mouseClickOverlay.html` - 鼠标覆盖层 HTML 入口
- `src/renderer/src/pages/mouseClickOverlay/App.vue` - 鼠标覆盖层组件
- `src/renderer/src/pages/mouseClickOverlay/index.ts` - 鼠标覆盖层入口文件
- `src/renderer/keyboardOverlay.html` - 键盘覆盖层 HTML 入口
- `src/renderer/src/pages/keyboardOverlay/App.vue` - 键盘覆盖层组件
- `src/renderer/src/pages/keyboardOverlay/index.ts` - 键盘覆盖层入口文件

### 配置
- `electron.vite.config.ts` - 添加了 mouseClickOverlay 和 keyboardOverlay 入口
- `src/types/index.ts` - 类型定义
- `src/preload/index.ts` - IPC API

## 使用方法

### 1. 安装依赖

```bash
pnpm add uiohook-napi
```

### 2. 启动应用

```bash
pnpm dev
```

### 3. 测试

1. 开始录制（区域录制或全屏录制）
2. 点击桌面任意位置（包括其他应用）- 应该看到蓝色波纹动画
3. 按下键盘按键 - 应该在左下角看到按键名称显示
4. 下层应用正常响应点击和按键
5. 停止录制并查看视频，确认效果已被录制

## 关键特性

- ✅ **真正的全局监听**：使用系统级钩子，可以捕获任何位置的点击和按键
- ✅ **完全穿透**：覆盖层窗口不阻止任何操作
- ✅ **自动生命周期**：录制开始时自动启动，结束时自动停止
- ✅ **高性能**：原生模块，性能优异
- ✅ **跨平台**：支持 Windows、macOS、Linux
- ✅ **键盘按键显示**：在左下角显示按下的键盘按键，支持多个按键同时显示

## 技术细节

### uiohook-napi 事件

```typescript
// 鼠标事件
uIOhook.on('mousedown', (event) => {
  const { x, y } = event;
  // x, y 是屏幕绝对坐标
});

// 键盘事件
uIOhook.on('keydown', (event) => {
  const { keycode } = event;
  // keycode 是按键代码，需要映射为按键名称
});
```

### 覆盖层窗口配置

```typescript
// 鼠标点击覆盖层（全屏）
{
  width: screenWidth,
  height: screenHeight,
  x: 0,
  y: 0,
  transparent: true,
  alwaysOnTop: true,
  focusable: false,
  setIgnoreMouseEvents(true, { forward: true })
}

// 键盘按键覆盖层（左下角）
{
  width: 300,
  height: 100,
  x: 20,
  y: screenHeight - height - 80,
  transparent: true,
  alwaysOnTop: true,
  focusable: false,
  setIgnoreMouseEvents(true, { forward: true })
}
```

### IPC 通信

```typescript
// 主进程 → 鼠标覆盖层
overlayWin.webContents.send(
  'mouse-click-overlay:on-mouse-click',
  x,
  y
);

// 主进程 → 键盘覆盖层
keyboardOverlayWin.webContents.send(
  'keyboard-overlay:on-key-press',
  keyName
);

// 覆盖层接收
window.electronAPI.onMouseClick((x, y) => {
  showRipple(x, y);
});

window.electronAPI.onKeyPress((keyName) => {
  showKey(keyName);
});
```

## 性能优化

1. **动态加载**：uiohook-napi 仅在需要时加载
2. **自动清理**：动画结束后自动移除 DOM 元素
3. **CSS 动画**：使用 GPU 加速的 CSS 动画
4. **事件节流**：可以添加节流避免过多事件

## 故障排除

### 问题 1：uiohook-napi 加载失败

**错误信息**：
```
Failed to load uiohook-napi
```

**解决方案**：
1. 确认已安装：`pnpm list uiohook-napi`
2. 重新安装：`pnpm add uiohook-napi`
3. 重新构建：`pnpm run build`

### 问题 2：点击效果不显示

**检查步骤**：
1. 打开主进程控制台，查看是否有 `[GlobalMouseListener] Mouse clicked at:` 日志
2. 检查覆盖层窗口是否创建：应该看到红色边框（调试模式）
3. 打开覆盖层开发者工具，检查是否接收到事件

### 问题 3：应用崩溃

**可能原因**：
- uiohook-napi 版本不兼容
- Node.js 版本不匹配

**解决方案**：
1. 检查 Node.js 版本：`node -v`（建议 >= 18）
2. 检查 Electron 版本
3. 查看 uiohook-napi 文档确认兼容性

## 自定义配置

### 修改鼠标波纹样式

编辑 `src/renderer/src/pages/mouseClickOverlay/App.vue`：

```css
.click-ripple {
  width: 50px;              /* 初始大小 */
  height: 50px;
  border: 4px solid rgba(59, 130, 246, 0.9);  /* 边框颜色 */
  background: rgba(59, 130, 246, 0.25);       /* 填充颜色 */
  animation: ripple-animation 0.6s ease-out;  /* 动画时长 */
}
```

### 修改键盘按键样式

编辑 `src/renderer/src/pages/keyboardOverlay/App.vue`：

```css
.key-display {
  background: rgba(0, 0, 0, 0.85);  /* 背景颜色 */
  color: #ffffff;                    /* 文字颜色 */
  padding: 12px 24px;                /* 内边距 */
  border-radius: 8px;                /* 圆角 */
  font-size: 24px;                   /* 字体大小 */
  font-weight: 600;                  /* 字体粗细 */
}
```

### 修改键盘覆盖层位置

编辑 `src/main/win/keyboardOverlayWin.ts`：

```typescript
// 左下角位置（留出一些边距）
const x = 20;  // 距离左边的距离
const y = screenHeight - height - 80;  // 距离底部的距离
```

### 修改显示的按键数量

编辑 `src/renderer/src/pages/keyboardOverlay/App.vue`：

```typescript
// 如果显示的按键超过 3 个，移除最旧的
if (displayedKeys.value.length > 3) {  // 修改这个数字
  displayedKeys.value.shift();
}
```

### 修改动画效果

```css
@keyframes ripple-animation {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2.2);  /* 最终缩放 */
    opacity: 0;
  }
}
```

### 添加事件节流

在 `src/main/globalMouseListener.ts` 中：

```typescript
let lastClickTime = 0;
const CLICK_THROTTLE = 100; // 100ms 节流

uIOhook.on('mousedown', (event: any) => {
  const now = Date.now();
  if (now - lastClickTime < CLICK_THROTTLE) {
    return; // 忽略过快的点击
  }
  lastClickTime = now;
  
  // 处理点击...
});
```

## 移除调试代码

测试完成后，移除 `src/renderer/src/pages/mouseClickOverlay/App.vue` 中的红色边框：

```css
.mouse-click-overlay {
  /* 移除这两行 */
  /* border: 2px solid red; */
  /* background: rgba(255, 0, 0, 0.05); */
}
```

## 下一步

1. 添加设置选项，允许用户自定义波纹和按键显示效果
2. 支持多显示器
3. 添加鼠标轨迹显示
4. 添加组合键显示（如 Ctrl+C）
5. 性能监控和优化
6. 添加按键显示的主题和样式选项
