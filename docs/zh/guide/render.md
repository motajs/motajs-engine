# 渲染系统

渲染系统基于 vue 制作，可以利用 vue 的响应式特性在画布上实现与 DOM 树类似的渲染功能，对于游戏来说非常方便。

## 基本示例

### 创建渲染器

```ts
import { MotaRenderer } from '@motajs/client';

const main = new MotaRenderer({
    canvas: '#main',
    width: 1920,
    height: 1080
});
```

### 渲染内容

:::code-group

```ts [原生ts]
import { Text } from '@motajs/client';

const text = new Text('测试文本');
text.pos(100, 100);
text.setStyle('black');

main.appendChild(text);
```

```tsx [tsx]
import { createApp } from '@motajs/client';
import { defineComponent } from 'vue';

const RootComponent = defineComponent(() => {
    return () => (
        <container>
            <text fillStyle="black" text="测试文本" />
        </container>
    );
});

createApp(RootComponent).mount(main);
```

:::

### 配置 vite 使用 tsx

你需要先安装 `@vitejs/plugin-vue-jsx`，如果你不使用 vue sfc 的话，可以不安装 `@vitejs/plugin-vue`。

然后在配置中调用插件，并配置自定义元素：

```ts
import { defineConfig } from 'vite';
import jsx from '@vitejs/plugin-vue-jsx';

const custom = [
    'container',
    'image',
    'sprite',
    'shader',
    'text',
    'comment',
    'custom',
    'container-custom'
];

export default defineConfig({
    plugins: [
        jsx({
            isCustomElement: tag => {
                return custom.includes(tag) || tag.startsWith('g-');
            }
        })
    ]
});
```

## 深入使用

请查看 [渲染元素](./render-elements.md)。
