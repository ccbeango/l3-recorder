# 透明窗口配置说明

## 概述

键盘按键覆盖层使用完全透明的窗口，确保不会出现白色底边或其他背景色，同时不影响用户点击窗口下方的其他应用。

## 配置要点

### 1. Electron 窗口配置

📁 `src/main/win/keyboardOverlayWin.ts`

```typescript
super({
  frame: false,           // 无边框
  transparent: true,      // 透明窗口
  alwaysOnTop: true,      // 始终置顶
  skipTaskbar: true,      // 不显示在任务栏
  hasShadow: false,       // 无阴影
  focusable: false,       // 不可获得焦点
  // ...
});

// 设置窗口完全穿透，不阻止任何鼠标事件
this.win?.setIgnoreMouseEvents(true, { forward: true });
```

**关键配置：**
- `transparent: true` - 启用透明窗口
- `frame: false` - 移除窗口边框
- `hasShadow: false` - 移除窗口阴影
- `setIgnoreMouseEvents(true, { forward: true })` - 完全穿透鼠标事件

### 2. HTML 配置

📁 `src/renderer/keyboardOverlay.html`

```html
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html,
  body {
    width: 100%;
    height: 100%;
    background: transparent !important;
    overflow: hidden;
  }
  #app {
    width: 100%;
    height: 100%;
    background: transparent !important;
  }
</style>
```

**关键点：**
- 所有元素的背景都设置为 `transparent`
- 使用 `!important` 确保样式优先级
- 移除所有 margin 和 padding

### 3. Vue 组件配置

📁 `src/renderer/src/pages/keyboardOverlay/App.vue`

```vue
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: transparent !important;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
  background: transparent !important;
}
</style>

<style scoped>
.keyboard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: transparent;
}
</style>
```

**关键点：**
- 全局样式（非 scoped）设置 body 和 #app 透明
- 根元素使用 `position: fixed` 覆盖整个窗口
- `pointer-events: none` 确保不阻止点击
- 所有背景都设置为 `transparent`

## 透明度层次

```
┌─────────────────────────────────────┐
│  Electron 窗口 (transparent: true)   │  ← 完全透明
│  ┌───────────────────────────────┐  │
│  │  HTML body (transparent)      │  │  ← 完全透明
│  │  ┌─────────────────────────┐  │  │
│  │  │  #app (transparent)     │  │  │  ← 完全透明
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │  .keyboard-overlay│  │  │  │  ← 完全透明
│  │  │  │  ┌─────────────┐  │  │  │  │
│  │  │  │  │  容器 (磨玻璃)│  │  │  │  │  ← 半透明
│  │  │  │  │  ┌─────────┐│  │  │  │  │
│  │  │  │  │  │ 按键徽章││  │  │  │  │  ← 半透明
│  │  │  │  │  └─────────┘│  │  │  │  │
│  │  │  │  └─────────────┘  │  │  │  │
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 点击穿透机制

### setIgnoreMouseEvents 配置

```typescript
this.win?.setIgnoreMouseEvents(true, { forward: true });
```

**参数说明：**
- `true` - 忽略所有鼠标事件
- `{ forward: true }` - 将鼠标事件转发给下层窗口

**效果：**
- 用户点击覆盖层窗口时，点击事件会穿透到下层应用
- 覆盖层窗口完全不响应鼠标事件
- 下层应用正常接收所有鼠标事件

### pointer-events: none

```css
.keyboard-overlay {
  pointer-events: none;
}
```

**作用：**
- CSS 层面禁用鼠标事件
- 与 Electron 的 `setIgnoreMouseEvents` 配合使用
- 确保 DOM 元素不捕获鼠标事件

## 常见问题

### Q1: 为什么会出现白色底边？

**原因：**
- HTML/body 默认有白色背景
- 某些 CSS 框架会设置默认背景色
- Vue 组件可能继承了背景色

**解决方案：**
1. 在 HTML 中设置全局透明样式
2. 在 Vue 组件中使用全局样式（非 scoped）
3. 使用 `!important` 确保样式优先级

### Q2: 如何确保完全透明？

**检查清单：**
- [ ] Electron 窗口设置 `transparent: true`
- [ ] HTML body 设置 `background: transparent !important`
- [ ] #app 设置 `background: transparent !important`
- [ ] 根组件设置 `background: transparent`
- [ ] 移除所有默认的背景色

### Q3: 点击穿透不生效怎么办？

**检查清单：**
- [ ] 调用 `setIgnoreMouseEvents(true, { forward: true })`
- [ ] CSS 设置 `pointer-events: none`
- [ ] 确保没有子元素设置 `pointer-events: auto`
- [ ] 检查是否有其他窗口遮挡

### Q4: 磨玻璃效果显示异常？

**可能原因：**
- 窗口不透明会影响 backdrop-filter 效果
- 需要确保窗口透明才能看到模糊效果

**解决方案：**
- 确保窗口配置正确
- 检查浏览器是否支持 backdrop-filter
- 使用 -webkit-backdrop-filter 兼容 Safari

## 调试技巧

### 1. 检查窗口透明度

在主进程控制台：
```javascript
console.log('Window transparent:', win.isTransparent());
```

### 2. 检查背景色

在渲染进程开发者工具：
```javascript
console.log('Body background:', getComputedStyle(document.body).background);
console.log('App background:', getComputedStyle(document.getElementById('app')).background);
```

### 3. 检查点击穿透

尝试点击覆盖层窗口，观察：
- 是否能点击到下层应用
- 控制台是否有鼠标事件日志
- 下层应用是否正常响应

### 4. 视觉检查

- 使用截图工具查看窗口
- 检查是否有白色边框或背景
- 观察磨玻璃效果是否正常

## 最佳实践

### 1. 样式优先级

```css
/* 使用 !important 确保透明 */
body {
  background: transparent !important;
}

/* 全局样式优先于 scoped 样式 */
<style>
  /* 全局透明设置 */
</style>

<style scoped>
  /* 组件样式 */
</style>
```

### 2. 多层透明

确保每一层都是透明的：
```
Electron 窗口 → HTML → body → #app → 根组件
     ↓           ↓      ↓      ↓        ↓
  transparent  transparent  transparent  transparent
```

### 3. 点击穿透

同时使用两种方法：
```typescript
// Electron 层面
win.setIgnoreMouseEvents(true, { forward: true });
```

```css
/* CSS 层面 */
.overlay {
  pointer-events: none;
}
```

## 性能考虑

### 透明窗口的性能影响

- **GPU 使用**：透明窗口需要 GPU 合成
- **内存占用**：略高于普通窗口
- **渲染性能**：backdrop-filter 需要额外计算

### 优化建议

1. **限制窗口大小**：只覆盖必要区域
2. **减少重绘**：避免频繁更新 DOM
3. **使用 CSS 动画**：比 JavaScript 动画性能更好
4. **合理使用模糊**：过大的模糊半径会影响性能

## 相关文档

- [键盘按键高亮功能](./KEYBOARD_HIGHLIGHT_FEATURE.md)
- [UI 设计详解](./KEYBOARD_UI_DESIGN.md)
- [快速参考](./QUICK_REFERENCE.md)

## 参考资源

- [Electron BrowserWindow 文档](https://www.electronjs.org/docs/latest/api/browser-window)
- [CSS backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [CSS pointer-events](https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events)
