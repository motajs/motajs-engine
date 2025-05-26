---
lang: zh-CN
---

# UI 优化指南

多数情况下，我们编写的简单 UI 并不需要特别的性能优化，渲染系统的懒更新及缓存机制已经可以有很优秀的性能表现，不过我们还是可能会遇到一些需要特殊优化的场景，本节将会讲述如何优化 UI 的性能表现，优化建议包括：避免元素平铺；避免元素自我更新；使用 `cache` 和 `nocache` 标识；特殊场景禁用抗锯齿和高清；在合适场景下隐藏一些元素等。

## 避免元素平铺

我们需要尽量避免元素平铺，因为这会导致更新时渲染次数上升，从而引起性能下降。我们建议善用树形结构的缓存特性，将可以作为一个整体的元素使用一个容器 `container` 包裹起来，减少更新时的渲染次数，尤其是对于那些不常更新的元素来说，更应该使用容器包裹。不过我们也不建议嵌套过深，这可能导致浪费在递归渲染上的时间过长，渲染效率变低。

画布渲染树的深度遍历特性使得：

-   每个独立容器的更新会触发子树的重新渲染
-   容器层级过深会增加递归调用栈开销
-   合理分组可将高频/低频更新元素隔离

下面是代码示例：

```tsx
// ❌ 差的写法，全部平铺在一个容器里
<container>
    <text text="1" />
    {/* 中间省略 998 个元素 */}
    <text text="1000" />
</container>

// ✅ 好的写法
<container>
    {/* 把不常更新的单独放到一个容器里面 */}
    <container>
        <text text="1" />
        {/* 中间省略 988 个元素 */}
        <text text="990" />
    </container>
    {/* 把常更新的单独放到一个容器里面 */}
    <container>
        <text text="991" />
        {/* 中间省略 8 个元素 */}
        <text text="1000" />
    </container>
</container>
```

## 避免元素自我更新

元素自我更新是指，在元素的渲染函数内，触发了元素的冒泡更新，这会导致更新无限循环，而且难以察觉。为了解决难以察觉的问题，我们使用了一种方式来专门探测这种情况。常见的触发元素自我更新的场景就是使用 `sprite` 元素，例如：

```tsx
const element = ref<Sprite>();
const render = () => {
    element.value?.update();
};

<sprite render={render} ref={element} />;
```

在上面这段渲染代码中，`sprite` 元素的渲染函数又再次触发了自我更新，这会导致更新无限循环。这种情况会在控制台抛出警告：`Unexpected recursive call of Sprite.update?uid in render function. Please ensure you have to do this, if you do, ignore this warn.`，这会告诉你是哪个类型的元素触发了循环更新，以及对应元素的 `uid`，从而帮助你寻找问题所在。

## 使用 `cache` 和 `nocache` 标识

`cache` 和 `nocache` 表示可以让你更加精确地控制渲染树的缓存行为，从而更好地优化渲染性能。默认情况下，这些元素是会被缓存的：`container` `container-custom` `template` `sprite` `image`，对于这些元素，你可以使用 `nocache` 标识来禁用它们的缓存，对于其本身或其子元素的渲染较为简单的场景，禁用缓存后渲染效率可能会更高。其他元素默认是禁用缓存的，如果你的渲染内容比较复杂，例如 `g-path` 元素的路径很复杂，可以使用 `cache` 表示来启用缓存，从而提高渲染效率。示例代码如下：

```tsx
const render = (canvas: MotaOffscreenCanvas2D) => {
    canvas.ctx.fillRect(0, 0, 200, 200);
};
// ❌ 差的写法，一个简单的矩形绘制，但是 sprite 默认启用缓存，可能会拉低渲染效率
<sprite render={render} />;

// ✅ 好的写法，使用 nocache 标识禁用 sprite 的缓存机制
<sprite render={render} nocache />;
```

## 特殊场景禁用抗锯齿和高清

默认情况下，大部分元素都是默认启用高清和抗锯齿的，这可能会导致一些不必要的计算出现，从而拉低渲染性能。对于一些需要保持像素风的内容，我们建议关闭抗锯齿和高清画布。代码示例如下：

```tsx
// ❌ 差的写法，像素风图片使用默认设置，启用了抗锯齿和高清
<image image="pixel.png" />
// ✅ 好的写法，关闭了默认的抗锯齿和高清
<image image="pixel.png" noanti hd={false} />
```

## 在合适场景下隐藏一些元素

如果一个元素在某些场景下需要隐藏，另一些场景下需要显示，我们建议使用 `hidden` 属性来设置，而不是通过把它移动到画面外、调成透明颜色、使用 `if` 或三元表达式判断等方式。示例代码如下：

```tsx
// ❌ 差的写法，使用条件表达式切换元素显示与否
{
    !hidden.value && <sprite />;
}
// ✅ 好的写法，使用 hidden 属性
<sprite hidden={hidden.value} />;
```

## 后续计划

我们后续计划推出渲染树调试工具，届时可以更加细致方便地查看渲染树的渲染情况以及性能问题。
