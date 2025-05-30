# Rendering Elements

_This document is translated by DeepSeek._

This section explains commonly used rendering elements and their basic usage in the UI system.

## Common Attributes

UI elements share many common attributes. We'll first introduce these, as they can be used with any rendering element or UI component.

### Positioning Attributes

Elements include several positioning attributes, with `loc` being the most commonly used. We recommend using this attribute exclusively for modifying element positioning. Its type declaration is as follows:

```ts
type ElementLocator = [
    x?: number,
    y?: number,
    w?: number,
    h?: number,
    ax?: number,
    ay?: number
];
```

These attributes are grouped in pairs (`x, y`; `w, h`; `ax, ay`), where each pair is optional—either both values are provided or neither.

-   **`x`, `y`**: The element's position, describing the anchor point location when unrotated. For example, `[32, 32]` places the anchor point at `(32, 32)`. By default, the anchor is at the top-left corner, meaning the element's top-left corner aligns with `(32, 32)`.
-   **`w`, `h`**: The element's width and height, describing its un-scaled rectangular dimensions (default is no scaling).
-   **`ax`, `ay`**: The anchor point's relative position within the element. All transformations (e.g., rotation, scaling) reference this point. `0` represents the leftmost/topmost edge, `1` the rightmost/bottommost edge. Values outside `[0, 1]` are allowed (e.g., `[-1, 1]` places the anchor one element-width to the left and at the bottom edge).

**Example:**

```tsx
// Centers the element at (32, 32) with a 64x64 size (anchor at center)
<sprite loc={[32, 32, 64, 64, 0.5, 0.5]} />
```

Alternatively, use the `anc` attribute to adjust the anchor:

```tsx
// Right-aligned, vertically centered
<sprite anc={[1, 0.5]} />
```

While manual properties (`x`, `y`, `width`, `height`, `anchorX`, `anchorY`) are supported, they are verbose and discouraged:

```tsx
<sprite x={32} y={32} width={64} height={64} anchorX={0.5} anchorY={0.5} />
```

**Note on `type`**:  
The `type` attribute defines positioning mode. Default is `static` (conventional positioning). In `absolute` mode, elements remain fixed at the top-left corner regardless of positioning attributes (highly discouraged; may be deprecated).

---

### Depth (`zIndex`)

The `zIndex` attribute controls element layering:

-   Higher `zIndex` values place elements above lower ones.
-   Elements with higher `zIndex` block interaction events from reaching elements beneath them.
-   Unset `zIndex` defaults to stacking order (later elements appear above earlier ones).

**Example:**

```tsx
// This element appears above
<sprite zIndex={10} />
// This element appears below
<sprite zIndex={5} />
```

---

### Effect Attributes

Includes `filter`, `composite`, and `alpha`.

#### `filter`

Applies visual filters (referencing [CanvasRenderingContext2D.filter](https://developer.mozilla.org/en-US/docs/Web/CSS/filter)). Supports built-in functions or SVG filters. Default: none.

**Example:**

```tsx
// 150% brightness, 120% contrast
<sprite filter="brightness(150%) contrast(120%)" />
```

#### `composite`

Defines blending mode with previously rendered elements (referencing [CanvasRenderingContext2D.globalCompositeOperation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)). Supports 26 values. Default: `source-over` (alpha blending).

**Example:**

```tsx
// Additive blending (RGB values summed)
<sprite composite="lighter" />
```

#### `alpha`

Controls opacity (`1` = fully opaque, `0` = fully transparent). Colors are multiplied by this value during blending. Default: `1`.

**Note**: Even at `alpha=1`, transparency may occur if the canvas content itself is translucent (e.g., a semi-transparent rectangle).

**Example:**

```tsx
// A semi-transparent element
<sprite alpha={0.5} />
```

### Caching Attributes

The `cache` and `nocache` attributes control an element's caching behavior:

-   **`nocache`**: Disables caching for the element (highest priority; forces no caching).
-   **`cache`**: Enables caching (useful for elements that default to no caching; lower priority than `nocache`).

Neither attribute can be dynamically set (i.e., reactive changes are unsupported).

**Example:**

```tsx
// Simple inner content; caching is unnecessary
<container nocache>
    <text />
</container>

// Complex path rendering; enable caching for `g-path`
<g-path path={veryComplexPath} cache />
```

---

### Overflow Behavior

Overflow occurs when a child element exceeds its parent's bounds (e.g., a `100x100` child at `(150, 50)` inside a `200x200` parent).

-   **Default behavior**: Clipping (overflow content is hidden). Adjust container dimensions as needed.
-   **`nocache` mode**: Overflow content may render (due to bypassing cache constraints), but this is **not recommended** for UI design—behavior may change in future updates.

---

### Hiding Elements

Use the `hidden` attribute to toggle visibility:

```tsx
const hidden = ref(false);
// Typically controlled reactively (constants are meaningless)
<sprite hidden={hidden.value} />;
```

---

### Interaction Attributes

#### `cursor`

Sets the mouse pointer style when hovering (referencing [CSS: cursor](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor)).

**Example:**

```tsx
// Shows a "pointer" hand icon on hover
<sprite cursor="pointer" />
```

#### `noevent`

Disables all events, allowing them to pass through to lower-`zIndex` elements.

**Example:**

```tsx
// Blocks no events despite high zIndex
<sprite zIndex={100} noevent />

// This onClick will now trigger normally
<sprite zIndex={10} onClick={click} />
```

---

### High-DPI & Anti-Aliasing

Attributes: `hd`, `anti`, `noanti`.

-   **`hd`**: Enables high-DPI rendering (default: `true` for most elements).
-   **`anti`**: Manually enables anti-aliasing (for elements that default to off).
-   **`noanti`**: Disables anti-aliasing (overrides `anti`; useful for pixel art/icons, improves performance).

**Example:**

```tsx
// Disable high-DPI
<sprite hd={false} />

// Disable anti-aliasing
<sprite noanti />
```

---

### Transformation Attributes

#### Simplified Transforms

Use `rotate`, `scale`, and `loc` for basic transformations:

```tsx
// Rotate 90° clockwise, scale horizontally by 1.5x, no vertical scaling
<sprite rotate={Math.PI / 2} scale={[1.5, 1]} loc={[32, 32]} />
```

**Notes:**

-   Without an anchor (`ax`, `ay`), `loc` references the **pre-rotation top-left corner** (which may shift after rotation).
-   Positive rotation = clockwise; negative = counterclockwise.

#### Advanced Transforms

For full control, use `transform` (covers translation, rotation, scaling). Transformation order matters (e.g., rotate-then-scale ≠ scale-then-rotate).

### Transform Matrix Operations

#### Core Functionality

First, create an instance:

```ts
import { Transform } from '@motajs/client';

const trans = new Transform();
```

Chain methods to modify the matrix:

```ts
// Method chaining example
trans
    .setTranslate(100, 50)
    .rotate(Math.PI / 4)
    .scale(2, 1.5);
```

**Method Comparison**

| Type     | Behavior                      | Methods                                                 |
| -------- | ----------------------------- | ------------------------------------------------------- |
| Additive | Applies changes incrementally | `translate`, `rotate`, `scale`, `transform`             |
| Absolute | Overrides current values      | `setTranslate`, `setRotate`, `setScale`, `setTransform` |

---

#### Key Methods

**Translation**

```ts
// Relative movement (additive)
trans.translate(20, -10);
// Absolute positioning (overrides)
trans.setTranslate(200, 150);
```

**Rotation**

```ts
// Add 45° rotation (additive)
trans.rotate(Math.PI / 4);
// Set absolute rotation angle
trans.setRotate(Math.PI / 2);
```

**Scaling**

```ts
// Scale X by 2x, Y unchanged (additive)
trans.scale(2, 1);
// Set absolute scale
trans.setScale(0.5, 0.8);
```

---

#### Advanced Features

**Matrix Operations**

```ts
// Manual matrix configuration
trans.setTransform(
    1,
    0, // Scale components
    0,
    1, // Rotation components
    100,
    50 // Translation components
);

// Matrix multiplication (combine transforms)
const combined = trans.multiply(otherTransform);
```

**Coordinate Conversion**

```ts
// Local → World coordinates
const worldPos = trans.transformed(10, 20);
// World → Local coordinates (inverse transform)
const localPos = trans.untransformed(150, 80);
```

---

#### Performance Optimization

**Auto-Update Mechanism**

```ts
import { ITransformUpdatable } from '@motajs/client';

class MyElement implements ITransformUpdatable {
    updateTransform() {
        console.log('Transform updated!');
    }
}

const element = new MyElement();
trans.bind(element); // Auto-triggers updateTransform on changes
```

---

#### Best Practices

**Recommended Execution Order**:

1. **Scale**
2. **Rotate**
3. **Translate**

```ts
// Correct order example
trans
    .setScale(2)
    .rotate(Math.PI / 3)
    .setTranslate(100, 50);
```

**Combining Transforms**

```ts
// Create child transform
const childTrans = trans
    .clone() // Copy original to avoid mutation
    .rotate(-Math.PI / 6)
    .translate(30, 0);

// Apply combined transform
const finalTrans = trans.multiply(childTrans);
```

---

#### Applying to Elements

Assign to the `transform` attribute:

```tsx
<sprite transform={finalTrans} />
```

---

#### Troubleshooting

1. **Transform not working?**

    - Verify the `trans` object is assigned to the element's `transform` property.

2. **Performance issues**
    - Avoid frequent `setTransform` calls.
    - Prefer additive methods over direct matrix operations.
    - Use `clone()` to reuse existing transforms.

## `sprite` Element

The `sprite` element allows custom rendering through its `render` property, which accepts a function with the following signature:

```ts
type RenderFn = (canvas: MotaOffscreenCanvas2D, transform: Transform) => void;
```

-   **`canvas`**: The target canvas for rendering (primary focus).
-   **`transform`**: The element's transformation matrix relative to its parent (rarely used).

Most use cases only require the first parameter. Refer to the [API documentation](../api/motajs-render-core/MotaOffscreenCanvas2D.md) for `MotaOffscreenCanvas2D`.

**Example:**

```tsx
const render = (canvas: MotaOffscreenCanvas2D) => {
    const { ctx, width, height } = canvas;
    ctx.fillStyle = '#d84';
    ctx.fillRect(0, 0, width, height);
};

<sprite render={render} />;
```

---

## `container` Element

The `container` groups child elements for rendering. It introduces no additional properties. **Note**: Most other elements cannot host children, you should use `container` as the primary wrapper.

---

## `container-custom` Element

A specialized container allowing custom child rendering logic. It includes a `render` property:

```ts
type CustomContainerRenderFn = (
    canvas: MotaOffscreenCanvas2D,
    children: RenderItem[],
    transform: Transform
) => void;
```

-   **`canvas`**: Rendering target canvas.
-   **`children`**: Child elements sorted by ascending `zIndex`.
-   **`transform`**: Parent-relative transformation matrix (rarely used).

**Example:**

```tsx
const render = (
    canvas: MotaOffscreenCanvas2D,
    children: RenderItem[],
    transform: Transform
) => {
    children.forEach(v => {
        if (v.hidden) return; // Skip hidden elements
        v.renderContent(canvas, transform); // Render each child
    });
};

<container-custom render={render} />;
```

---

## `text` Element

Displays text, automatically calculating dimensions (avoid manual width/height settings to prevent misalignment). Additional properties:

```ts
interface TextProps extends BaseProps {
    /** Text content */
    text?: string;
    /** Fill color/style */
    fillStyle?: CanvasStyle;
    /** Stroke color/style */
    strokeStyle?: CanvasStyle;
    /** Font settings */
    font?: Font;
    /** Stroke width */
    strokeWidth?: number;
}
```

**Example:**

```tsx
import { Font } from '@motajs/client';

<text
    text="Sample Text"
    loc={[32, 32]} // Position only (omit width/height)
    fillStyle="#fff"
    strokeStyle="#d54"
    font={new Font(24)} // 24px default font
    strokeWidth={3} // 3px stroke
/>;
```

## `image` Element

The `image` element displays an image using the `image` property:

```tsx
// Load an image
const img = new Image();
// Display the image
<image image={img} />;
```

---

## Graphics Elements

This section covers graphics-related elements. The following content was generated by the _DeepSeek R1_ model and slightly modified.

### Common Attributes

All graphics elements support these core attributes:

| Category          | Key Attributes             | Description                                                                           |
| ----------------- | -------------------------- | ------------------------------------------------------------------------------------- |
| **Fill & Stroke** | `fill`, `stroke`           | Controls fill/stroke rendering (defaults vary by element)                             |
| **Style**         | `fillStyle`, `strokeStyle` | Fill/stroke colors/gradients (e.g., `'#f00'`)                                         |
| **Line Style**    | `lineWidth`, `lineDash`    | Line width and dash patterns (e.g., `[5, 3]` = 5px solid + 3px gap)                   |
| **Advanced**      | `fillRule`, `actionStroke` | Fill rules (nonzero/evenodd), whether to respond to interactions only in stroke areas |

---

### Rectangle `<g-rect>`

Position rectangles using `loc`:

```tsx
// Basic rectangle (default: fill-only; specify both `fill` and `stroke` for outlines)
// Note: Setting only `stroke` renders an outline without fill.
<g-rect loc={[100, 100, 200, 150]} fill stroke fillStyle="#f0f" lineWidth={2} />
```

---

### Circle & Sector `<g-circle>`

Parameters:

```ts
interface CirclesProps {
    radius: number; // Radius
    start?: number; // Start angle (radians, default: 0)
    end?: number; // End angle (radians, default: 2π)
    /**
     * Shorthand: `[centerX, centerY, radius?, start?, end?]`
     * - Radius is optional.
     * - Start/end must both be provided or omitted.
     */
    circle?: CircleParams;
}
```

**Examples**:

```tsx
// Full circle
<g-circle circle={[300, 200, 10]} fillStyle="skyblue" />

// Sector (60° to 180°)
<g-circle circle={[400, 300, 40, Math.PI/3, Math.PI]} />
```

---

### Line `<g-line>`

Core parameters:

```ts
interface LineProps {
    x1: number; // Start X
    y1: number; // Start Y
    x2: number; // End X
    y2: number; // End Y
    /** Shorthand: `[x1, y1, x2, y2]` (all required) */
    line: [number, number, number, number];
}
```

**Examples**:

```tsx
// Standard line
<g-line
    line={[50, 50, 200, 150]}
    strokeStyle="red"
    lineDash={[10, 5]}  // Dashed style
/>

// Arrowed reference line
<g-line
    // Non-shorthand syntax
    x1={300} y1={80}
    x2={450} y2={220}
    lineCap="round"     // Rounded endpoints
    lineWidth={4}
/>
```

### Cubic Bézier Curve `<g-bezier>`

Core parameters:

```ts
interface BezierProps {
    sx: number; // Start X
    sy: number; // Start Y
    cp1x: number; // Control point 1 X
    cp1y: number; // Control point 1 Y
    cp2x: number; // Control point 2 X (cubic Bézier)
    cp2y: number; // Control point 2 Y
    ex: number; // End X
    ey: number; // End Y
    /** Shorthand for cubic Bézier parameters: `[sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey]` (all required) */
    curve: BezierParams;
}
```

Examples:

```tsx
// Cubic Bézier curve
<g-bezier
    curve={[100, 100, 150, 50, 250, 200, 300, 100]}
    strokeStyle="purple"
    lineWidth={3}
/>;

// Dynamic path
const path = computed(() => [
    startX.value,
    startY.value,
    control1X.value,
    control1Y.value,
    control2X.value,
    control2Y.value,
    endX.value,
    endY.value
]);
<g-bezier curve={path.value} />;
```

### Quadratic Bézier Curve `<g-quad>`

Core parameters:

```ts
interface BezierProps {
    sx: number; // Start X
    sy: number; // Start Y
    cpx: number; // Control point X
    cpy: number; // Control point Y
    ex: number; // End X
    ey: number; // End Y
    /** Quadratic Bézier parameters: `[sx, sy, cpx, cpy, ex, ey]` (all required) */
    curve: QuadParams;
}
```

Examples:

```tsx
// Quadratic Bézier curve
<g-quad
    curve={[100, 100, 250, 200, 300, 100]}
    strokeStyle="purple"
    lineWidth={3}
/>;

// Dynamic path
const path = computed(() => [
    startX.value,
    startY.value,
    controlX.value,
    controlY.value,
    endX.value,
    endY.value
]);
<g-quad curve={path.value} />;
```

### Rounded Rectangle `<g-rectr>`

The rounded rectangle parameters are similar to CSS's border-radius:

```ts
interface RectRProps extends GraphicPropsBase {
    /**
     * Circular radius parameters: `[r1, r2, r3, r4]` (last three optional). Behavior by parameter count:
     * - 1 value: All corners use radius `r1`
     * - 2 values: Top-left/bottom-right use `r1`, top-right/bottom-left use `r2`
     * - 3 values: Top-left `r1`, top-right/bottom-left `r2`, bottom-right `r3`
     * - 4 values: Top-left `r1`, top-right `r2`, bottom-left `r3`, bottom-right `r4`
     */
    circle?: RectRCircleParams;
    /**
     * Elliptical radius parameters: `[rx1, ry1, rx2, ry2, rx3, ry3, rx4, ry4]` (pairs, last three pairs optional). Behavior by pair count:
     * - 1 pair: All corners use ellipse `[rx1, ry1]`
     * - 2 pairs: Top-left/bottom-right use `[rx1, ry1]`, top-right/bottom-left use `[rx2, ry2]`
     * - 3 pairs: Top-left `[rx1, ry1]`, top-right/bottom-left `[rx2, ry2]`, bottom-right `[rx3, ry3]`
     * - 4 pairs: Top-left `[rx1, ry1]`, top-right `[rx2, ry2]`, bottom-left `[rx3, ry3]`, bottom-right `[rx4, ry4]`
     */
    ellipse?: RectREllipseParams;
}
```

Examples:

```tsx
// Rectangle with 10px rounded corners
<g-rectr loc={[0, 0, 200, 200]} circle={[10]} />

// Rectangle with elliptical corners (10px horizontal, 5px vertical radius)
<g-rectr loc={[0, 0, 200, 200]} ellipse={[10, 5]} />

// Rectangle with 10px top-left/bottom-right and 25px top-right/bottom-left corners
<g-rectr loc={[0, 0, 200, 200]} circle={[10, 25]} />
```

### Custom Path `<g-path>`

Core parameter:

```ts
interface PathProps {
    path?: Path2D; // Custom path object
}
```

Example:

```tsx
// Create a star path
const starPath = new Path2D();
// ...path drawing logic
<g-path
    path={starPath}
    fill
    stroke
    fillStyle="orange"
    strokeStyle="#c00"
    lineWidth={2}
/>;
```

### Best Practice Recommendations

1. Interaction enhancement:

```tsx
<g-rect
    fill
    stroke
    actionStroke // Only respond to clicks on stroke area
    onClick={handleSelect}
/>
```

2. Style reuse:

```tsx
// Create style object
const themeStyle = {
    fillStyle: '#2c3e50',
    strokeStyle: '#ecf0f1',
    lineWidth: 2
};

<g-rect fill {...themeStyle} />
<g-circle stroke {...themeStyle} />
```
