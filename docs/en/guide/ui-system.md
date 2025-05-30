# UI System

_This document is translated by DeepSeek._

This section explains how the UI system works and introduces some commonly used APIs.

## Creating a Custom UI Manager

The engine provides the `UIController` class, allowing you to create your own UI manager within your UI. For example, the game screen itself can contain a UI manager that can be divided into three parts: cover screen, loading screen, and game interface. The game interface can further contain its own game UI manager.

### Creating a UIController Instance

Import the `UIController` class from `@motajs/client` and instantiate it:

```ts
import { UIController } from '@motajs/client';

// Pass a string as the controller's ID
export const myController = new UIController('my-controller');
```

### Retrieving a UI Controller

You can retrieve the controller by its ID or directly import it from the corresponding file:

```ts
import { UIController } from '@motajs/client';
import { myController } from './myController';

const myController = UIController.get('my-controller');
```

### Adding to the Render Tree

You can then call the `myController.render` method to add it to your UI:

```tsx
<container>{myController.render()}</container>
```

## UI Display Modes

### Built-in Display Modes

The UI manager comes with two built-in display modes: showing only the last UI and showing all UIs. The former is commonly used for cascading UIs, such as `Settings -> System Settings -> Shortcut Settings`, where only the last UI is displayed while previous ones remain hidden. The latter is often used for informational UIs, such as displaying monster information on a map. You can set the display mode using these methods, which take effect immediately. However, frequent switching is not recommended - it's best to use only one display mode per controller:

```ts
// Set to show only the last UI
myController.lastOnly();
// Set to show all UIs
myController.showAll();
```

### Stack Mode

For cascading UIs, we often want subsequent UIs to close when a parent UI is closed. For example, in the `Settings -> System Settings -> Shortcut Settings` cascade, closing the Settings UI should automatically close System Settings and Shortcut Settings rather than requiring manual closure. Stack mode enables this behavior - when closing a UI, all subsequent UIs will also close. You can still use the above methods to configure stack mode:

```ts
// Set to show last UI with stack mode enabled (enabled by default for lastOnly)
myController.lastOnly(true);
// Set to show last UI without stack mode
myController.lastOnly(false);
```

### Custom Display Mode

::: info
This subsection is optional and can be skipped if not needed.
:::

The engine's two built-in display modes and stack mode cover most use cases. However, for some special requirements, you can use the `showCustom` method to define a custom display mode. This method requires passing an `IUICustomConfig` object that implements five methods: `open`, `close`, `hide`, `show`, and `update`. Here's how to create a custom display mode.

Method explanations:

-   `open`: Called when a UI opens. For example, the default `lastOnly` mode adds the UI to the end of the stack and hides all previous UIs.
-   `close`: Called when a UI closes. The default `lastOnly` mode closes all UIs after the specified UI in this case.
-   `hide`: Called when a UI is hidden. The default `lastOnly` mode hides the UI display here.
-   `show`: Called when a UI is shown. The default `lastOnly` mode enables the UI display here.
-   `update`: Called when switching display modes. The default `lastOnly` mode shows the last UI and hides previous ones here.

For example, to create a reverse `lastOnly` mode that shows only the first UI and adds new UIs to the beginning of the queue:

```ts
import { IUICustomConfig, IUIInstance } from '@motajs/client';

const myCustomMode: IUICustomConfig = {
    open(ins: IUIInstance, stack: IUIInstance[]) {
        stack.forEach(v => v.hide()); // Hide all current UIs
        stack.unshift(ins); // Add the new UI to the beginning of the queue
        ins.show(); // Show the new UI
    },
    close(ins: IUIInstance, stack: IUIInstance[], index: number) {
        stack.splice(0, index + 1); // Close the specified UI and all previous ones
        stack[0]?.show(); // Show the first UI
    },
    hide(ins: IUIInstance, stack: IUIInstance[], index: number) {
        ins.hide(); // Simply hide
    },
    show(ins: IUIInstance, stack: IUIInstance[], index: number) {
        ins.show(); // Simply show
    },
    update(stack: IUIInstance[]) {
        stack.forEach(v => v.hide()); // First hide all UIs
        stack[0]?.show(); // Then show the first UI
    }
};

myController.showCustom(myCustomMode); // Apply the custom display mode
```

## Setting UI Background

We can set a background component for the UI that remains visible when the UI is open. We recommend using this method to set UI backgrounds as it can be combined with the `keep` debounce feature to prevent UI flickering issues. Here, we'll use the `Background` component from `@motajs/client` as an example to demonstrate how to set a background:

```ts
import { Background } from '@motajs/client';

// Pass the background component and set parameters
myController.setBackground(Background, { color: 'gray' });
```

By default, the background component automatically appears when opening a UI, but we can also manually control its visibility with higher priority than system settings:

```ts
myController.hideBackground(); // Hide background (won't show even if UIs are open)
myController.showBackground(); // Show background (only if UIs are open)
```

## Background Persistence Debounce

Sometimes when closing one UI and immediately opening another (e.g., when using an item that opens a new page), there may be a brief "background loss" during the transition, causing an undesirable flicker effect. To solve this, we provide background persistence debouncing via the `keep` method:

```ts
const keep = myController.keep();
```

After calling this, the background will temporarily persist until another UI opens, preventing flickering during rapid UI transitions. However, if no new UI opens, the background would remain indefinitely - which is undesirable. Therefore, the `keep` return value provides methods to properly handle this:

```ts
keep.safelyUnload(); // Recommended - safely unloads background if no UIs are open
keep.unload(); // Not recommended - immediately closes all UIs (rarely used)
```

## Opening and Closing UIs

The `open` method is defined as:

```ts
function open<T extends UIComponent>(
    ui: IGameUI<T>,
    props: UIProps<T>,
    alwaysShow?: boolean
): IUIInstance;
```

Parameters:

1. The UI component to open
2. Props to pass to the UI
3. Whether to keep the UI always visible (ignoring display modes)

Multiple instances of the same UI can be opened, even across different controllers. For example, to add a persistent "Return to Game" button:

```ts
// BackToGame is a custom UI component
myController.open(BackToGame, {}, true); // Third parameter keeps it always visible
```

To close UIs, use the `close` method with the UI instance returned by `open`:

```ts
const MyUI = defineComponent(props => {
    // All controller-opened UIs with props include controller/instance properties
    props.controller.close(props.instance);
}, myUIProps);
```

Additionally, there's a method to close all UIs:

```ts
function closeAll(ui?: IGameUI): void;
```

When called without parameters, it closes all UIs. With a UI type parameter, it closes only that type. For example, to close all `EnemyInfo` UIs:

```ts
myController.closeAll(EnemyInfo); // EnemyInfo is a custom UI
```
