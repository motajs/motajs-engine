# Motajs Engine

This document is translated by DeepSeek.

`Motajs Engine` is divided into multiple modules, allowing you to selectively install specific modules based on your project needs.

## Full Installation (Recommended)

:::code-group

```bash [npm]
npm i vue @motajs/client
```

```bash [pnpm]
pnpm add vue @motajs/client
```

:::

This installation method includes all sub-packages with built-in `tree-shaking` support, requiring no additional configuration—ready to use out of the box.

## Selective Installation

If you prefer to install only specific packages manually:

:::code-group

```bash [npm]
npm i @motajs/common @motajs/render
```

```bash [pnpm]
pnpm add @motajs/common @motajs/render
```

:::

Currently available sub-packages include:

-   `@motajs/common`
-   `@motajs/render`
-   `@motajs/components`
-   `@motajs/system-ui`
