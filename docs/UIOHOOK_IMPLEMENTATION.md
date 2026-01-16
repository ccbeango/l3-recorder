# 使用 uiohook-napi 实现全局鼠标点击高亮

## 实现方案

使用 `uiohook-napi` 原生模块实现真正的全局鼠标监听，可以捕获系统级别的鼠标点击事件。

## 工作原理

```
用户点击桌面任意位置
  ↓
uiohook-napi 捕获系统级鼠标事件
  ↓
globalMouseListener 接收事件
  ↓
通过 IPC 发送到覆盖层窗口
  ↓
覆盖层显示波纹动画
  ↓
效果被录制到视频中
```

## 文件结构

### 主进程
- `src/main/globalMouseListener.ts` - 全局鼠标监听器（使用 uiohook-napi）
- `src/main/win/mouseClickOverlayWin.ts` - 覆盖层窗口类
- `src/main/ipcMain.ts` - IPC 通信处理

### 渲染进程
- `src/renderer/mouseClickOverlay.html` - 覆盖层 HTML 入口
- `src/renderer/src/pages/mouseClickOverlay/App.vue` - 覆盖层组件
- `src/renderer/src/pages/mouseClickOverlay/index.ts` - 入口文件

### 配置
- `electron.vite.config.ts` - 添加了 mouseClickOverlay 入口
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
2. 点击桌面任意位置（包括其他应用）
3. 应该看到蓝色波纹动画
4. 下层应用正常响应点击
5. 停止录制并查看视频，确认效果已被录制

## 关键特性

- ✅ **真正的全局监听**：使用系统级钩子，可以捕获任何位置的点击
- ✅ **完全穿透**：覆盖层窗口不阻止任何操作
- ✅ **自动生命周期**：录制开始时自动启动，结束时自动停止
- ✅ **高性能**：原生模块，性能优异
- ✅ **跨平台**：支持 Windows、macOS、Linux

## 技术细节

### uiohook-napi 事件

```typescript
uIOhook.on('mousedown', (event) => {
  const { x, y } = event;
  // x, y 是屏幕绝对坐标
});
```

### 覆盖层窗口配置

```typescript
{
  transparent: true,      // 透明背景
  alwaysOnTop: true,      // 始终置顶
  focusable: false,       // 不可获得焦点
  setIgnoreMouseEvents(true, { forward: true })  // 完全穿透
}
```

### IPC 通信

```typescript
// 主进程 → 覆盖层
overlayWin.webContents.send(
  'mouse-click-overlay:on-mouse-click',
  x,
  y
);

// 覆盖层接收
window.electronAPI.onMouseClick((x, y) => {
  showRipple(x, y);
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

### 修改波纹样式

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

1. 添加设置选项，允许用户自定义波纹效果
2. 支持多显示器
3. 添加键盘按键高亮效果
4. 添加鼠标轨迹显示
5. 性能监控和优化
