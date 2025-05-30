# Rendering System FAQ

_This document is translated by DeepSeek._

## Why is my rendered content not displaying?

Check if the element's `zIndex` is as expected and whether it's being obscured by other elements. Also, verify if the element is in a `hidden` state.

Another possibility is that the element is outside its parent's bounds, causing it to be clipped. Note that the `transform` property affects the element's own coordinate space—if scaling, rotation, or other transformations are applied, consider how these may impact positioning.

## Why isn't my element's `onClick` event triggering?

Your element might be overlapped by another element with a higher `zIndex`, preventing event propagation. Try adding a `noevent` flag to the overlapping element to disable its events. Note that even a fully transparent element can block events, so inspect your render tree structure carefully.

Alternatively, event propagation might be interrupted by `e.stopPropagation()` in either child (bubbling phase) or parent (capturing phase) elements.

## Why doesn't the rendered content update when my data changes?

If you're using a `sprite` element and referencing external data in its render function, updates won't trigger automatically. Manual updates are required:

```tsx
import { Sprite } from '@motajs/client';

const mySprite = ref<Sprite>();
// Update the sprite when data changes
watch(data, () => mySprite.value?.update());

// Pass the ref to the sprite element
<sprite ref={mySprite} render={render} />;
```

Also, ensure your data is wrapped with `reactive` or `ref` for reactivity.

## The screen flickers black, then content disappears

This likely indicates a memory leak. When elements are unmounted, they should be destroyed. If not, GPU memory may exhaust, causing a black screen. The library handles most cases, but leaks often stem from custom components—for example:

-   Storing elements in a list but failing to remove them on unmount.
-   Not clearing timers or animation loops.

**Best practices:**

-   Remove manually stored elements on unmount.
-   Call `destroy()` on elements to ensure garbage collection.
-   Clear timers/intervals.
-   For frame-based logic, use `onTick` instead of manual loops.

## Why isn't my filter effect visible?

As of now, iOS still doesn’t support the `filter` property on `CanvasRenderingContext2D`. Filters won’t render on iOS devices. However, the `Shader` element (using WebGL2) allows custom filter implementation—though this requires graphics programming knowledge.

## Will rendering differ across devices?

Theoretically, aside from the iOS filter limitation, all rendering should be consistent. Report bugs if discrepancies occur.
