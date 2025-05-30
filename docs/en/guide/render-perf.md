# Rendering Performance Optimization Guide

_This document is translated by DeepSeek._

In most cases, simple UIs don't require special optimization—the rendering system's lazy updates and caching mechanisms already deliver excellent performance. However, certain scenarios may demand fine-tuning. This guide covers optimization strategies, including: avoiding flat element structures, preventing self-updating elements, using `cache` and `nocache` flags, disabling anti-aliasing/HD in specific cases, and strategically hiding elements.

---

## Avoid Flat Element Structures

Flattened element hierarchies increase render passes during updates, hurting performance. Instead:

-   **Group static elements** under shared `container` nodes to leverage subtree caching.
-   **Avoid excessive nesting**, which adds recursive rendering overhead.

Canvas render trees are depth-traversed, meaning:

-   Updates to a container trigger re-renders for its entire subtree.
-   Deep nesting increases call stack overhead.
-   Isolate frequently/rarely updated elements into separate containers.

**Example:**

```tsx
// ❌ Bad: Flat structure (all elements in one container)
<container>
    <text text="1" />
    {/* ... 998 more elements ... */}
    <text text="1000" />
</container>

// ✅ Good: Logical grouping
<container>
    {/* Infrequently updated elements */}
    <container>
        <text text="1" />
        {/* ... 988 elements ... */}
        <text text="990" />
    </container>
    {/* Frequently updated elements */}
    <container>
        <text text="991" />
        {/* ... 8 elements ... */}
        <text text="1000" />
    </container>
</container>
```

---

## Prevent Self-Updating Elements

Self-updates occur when an element’s render function triggers its own update, creating infinite loops. This is common with `sprite` elements:

```tsx
const element = ref<Sprite>();
const render = () => {
    element.value?.update(); // ❌ Self-update in render function!
};

<sprite render={render} ref={element} />;
```

The console warns:  
`Unexpected recursive call of Sprite.update?uid in render function. Please ensure you have to do this; if you do, ignore this warning.`

---

## Use `cache` and `nocache` Flags

Optimize rendering by controlling cache behavior:

-   **Cached by default**: `container`, `container-custom`, `template`, `sprite`, `image`. Use `nocache` to disable caching for simple renders.
-   **Uncached by default**: Other elements. Use `cache` for complex renders (e.g., intricate `g-path` paths).

**Example:**

```tsx
const render = (canvas: MotaOffscreenCanvas2D) => {
    canvas.ctx.fillRect(0, 0, 200, 200); // Simple draw
};

// ❌ Bad: Default caching harms performance for trivial renders
<sprite render={render} />

// ✅ Good: Disable caching for lightweight renders
<sprite render={render} nocache />
```

---

## Disable Anti-Aliasing/HD in Specific Cases

Anti-aliasing and HD canvases incur unnecessary computations for pixel-art styles. Disable them when needed:

```tsx
// ❌ Bad: Pixel art with anti-aliasing
<image image="pixel.png" />

// ✅ Good: Disable anti-aliasing and HD
<image image="pixel.png" noanti hd={false} />
```

---

## Hide Elements Strategically

Use the `hidden` property instead of workarounds like transparency, offscreen positioning, or conditional rendering:

```tsx
// ❌ Bad: Conditional rendering
{
    !hidden.value && <sprite />;
}

// ✅ Good: Native hiding
<sprite hidden={hidden.value} />;
```

---

## Future Plans

A **render tree debugger** is planned to visualize rendering performance and issues in detail.
