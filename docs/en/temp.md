## 设置 UI 背景

我们可以为 UI 设置背景组件，背景组件在 UI 打开时常亮。我们推荐使用此方法来为 UI 设置背景，因为它可以搭配 `keep` 防抖动来使用，避免出现 UI 闪烁的问题。现在，我们使用 `@motajs/client` 中的 `Background` 背景组件作为例子，来展示如何设置背景：

```ts
import { Background } from '@motajs/client';

// 传入背景组件作为背景，然后设置参数
myController.setBackground(Background, { color: 'gray' });
```

默认情况下，当我们打开 UI 时，背景组件将会自动展示，不过我们也可以手动控制背景组件是否显示，它的优先级高于系统优先级：

```ts
myController.hideBackground(); // 隐藏背景组件，即使有 UI 已经打开，也不会显示背景
myController.showBackground(); // 显示背景组件，在 UI 已经打开的情况下展示，没有 UI 打开时不显示
```

## 背景维持防抖动

有时候，我们需要关闭当前 UI 然后立刻打开下一个 UI，例如使用一个道具时可能会打开一个新的页面，这时候会先关闭道具背包界面，再打开道具的页面，这时候可能会出现短暂的“背景丢失”，这是因为 UI 的挂载需要时间，在极短的时间内如果没有挂载上，那么就会在屏幕上什么都不显示，上面设置的背景 UI 也不会显示，会引起一次闪烁，观感很差。为了解决这个问题，我们提供了背景维持防抖动的功能，使用 `keep` 方法来实现：

```ts
const keep = myController.keep();
```

调用此方法后，在下一次 UI 全部关闭时，背景会暂时维持，直到有 UI 打开，也就是说它会维持一次 UI 背景不会关闭，下一次就失效了。这样的话，如果我们去使用一个打开页面的道具，就不会出现闪烁的问题了。不过，假如我们使用了一个没有打开页面的道具，会有什么表现？答案是背景一直显示着，用户就什么也干不了了，这显然不是我们希望的，因此 `keep` 函数的返回值提供了一些能力来让你关闭背景，它们包括：

```ts
// 推荐方法，使用 safelyUnload 安全地卸载背景，这样如果有 UI 已经打开，不会将其关闭
keep.safelyUnload();
// 不推荐方法，调用后立刻关闭所有 UI，不常用
keep.unload();
```

## 打开与关闭 UI

在 UI 编写章节已经提到了打开和关闭 UI 使用 `open` 和 `close` 方法，现在我们更细致地讲解一下如何打开与关闭 UI。打开 UI 使用 `open` 方法，定义如下：

```ts
function open<T extends UIComponent>(
    ui: IGameUI<T>,
    props: UIProps<T>,
    alwaysShow?: boolean
): IUIInstance;
```

其中第一个参数表示要打开的 UI，第二个表示传给 UI 的参数，第三个表示 UI 是否永远保持显示状态（除非被关闭），不受到显示模式的影响。同种 UI 可以打开多个，也可以在不同的控制器上同时打开多个相同的 UI。例如，如果我们想在主 UI 控制器中添加一个常亮的返回游戏按钮，就可以这么写：

```ts
// BackToGame 是自定义 UI，第三个参数传 true 来保证它一直显示在画面上
myController.open(BackToGame, {}, true);
```

关闭 UI 使用 `close` 方法，传入 UI 实例，即 `open` 方法的返回值，没有其他参数。例如：

```ts
const MyUI = defineComponent(props => {
    // 所有通过 UI 控制器打开的，同时按照 UI 模板填写了 props 的 UI 都包含 controller 和 instance 属性
    props.controller.close(props.instance);
}, myUIProps);
```

除此之外，还提供了一个关闭所有 UI 的接口：

```ts
function closeAll(ui?: IGameUI): void;
```

其中参数表示要关闭的 UI 类型，不填时表示关闭所有 UI，填写时表示关闭所有指定类型的 UI。例如我想关闭所有 `EnemyInfo` UI，可以这么写：

```ts
// EnemyInfo 是自定义 UI
myController.closeAll(EnemyInfo);
```
