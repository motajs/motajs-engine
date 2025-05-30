# Rendering System

_This document is translated by DeepSeek._

The rendering system is built on Vue, leveraging its reactive features to provide DOM-like rendering capabilities on the canvas, making it highly convenient for game development.

## Basic Examples

### Creating a Renderer

```ts
import { MotaRenderer } from '@motajs/client';

const main = new MotaRenderer({
    canvas: '#main',
    width: 1920,
    height: 1080
});
```

### Rendering Content

:::code-group

```ts [Vanilla TS]
import { Text } from '@motajs/client';

const text = new Text('Test Text');
text.pos(100, 100);
text.setStyle('black');

main.appendChild(text);
```

```tsx [TSX]
import { createApp } from '@motajs/client';
import { defineComponent } from 'vue';

const RootComponent = defineComponent(() => {
    return () => (
        <container>
            <text fillStyle="black" text="Test Text" />
        </container>
    );
});

createApp(RootComponent).mount(main);
```

:::

### Configuring Vite for TSX

First, install `@vitejs/plugin-vue-jsx`. If you're not using Vue SFCs, you can skip installing `@vitejs/plugin-vue`.

Then, enable the plugin in your configuration and define custom elements:

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

## Advanced Usage

Refer to [Rendering Elements](./render-elements.md).
