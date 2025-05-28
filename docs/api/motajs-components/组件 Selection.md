# Selection 组件 API 文档

本文档由 `DeepSeek R1` 模型生成并微调。

---

## 核心特性

-   **动态高亮**：自动呼吸动画效果
-   **精准定位**：像素级坐标控制
-   **透明度动画**：可定制不透明度变化范围

---

## Props 属性说明

| 属性名       | 类型               | 默认值         | 描述                              |
| ------------ | ------------------ | -------------- | --------------------------------- |
| `loc`        | `ElementLocator`   | **必填**       | 光标定位                          |
| `color`      | `CanvasStyle`      | `#ddd`         | 填充颜色（无皮肤时生效）          |
| `border`     | `CanvasStyle`      | `gold`         | 边框颜色（无皮肤时生效）          |
| `alphaRange` | `[number, number]` | `[0.25, 0.55]` | 不透明度波动范围 [最小值, 最大值] |

---

## 使用示例

### 纯色模式

```tsx
// 自定义颜色方案
<Selection
    loc={[20, 240, 200, 32]}
    color="rgba(0,128,255,0.2)" // 填充颜色
    border="#00BFFF" // 边框颜色
    alphaRange={[0.5, 0.9]}
/>
```

---

## 注意事项

1. **样式优先级**  
   同时指定 `winskin` 和颜色参数时：

    ```tsx
    // 以下配置将忽略 color/border 参数
    <Selection winskin="winskin.png" color="red" border="blue" />
    ```

2. **动画速度**  
   呼吸动画固定为 2000ms/周期，暂不支持自定义时长

3. **点击反馈**  
   建议配合事件系统实现点击效果：
    ```tsx
    <container onClick={handleClick}>
        <Selection />
        <text />
    </container>
    ```
