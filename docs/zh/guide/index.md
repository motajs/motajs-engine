# Motajs Engine

`Motajs Engine` 分为多个模块，你可以根据项目需要选择性地安装部分模块。

## 全部安装（推荐）

:::code-group

```bash [npm]
npm i vue @motajs/client
```

```bash [pnpm]
pnpm add vue @motajs/client
```

:::

使用这种安装方式会安装所有的子包，同时包含 `tree-shaking` 能力，不需额外配置，开箱即用。

## 选择性安装

如果需要选择性安装部分包，可以手动安装：

:::code-group

```bash [npm]
npm i @motajs/common @motajs/render
```

```bash [pnpm]
pnpm add @motajs/common @motajs/render
```

:::

现在包含这些子包：

-   `@motajs/common`
-   `@motajs/render`
-   `@motajs/components`
-   `@motajs/system-ui`
