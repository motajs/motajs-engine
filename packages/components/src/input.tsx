import {
    DefaultProps,
    Container,
    ElementLocator,
    MotaRenderer,
    RenderItem,
    Transform,
    RectRCircleParams,
    Font,
    CanvasStyle
} from '@motajs/render';
import { computed, defineComponent, onUnmounted, ref, watch } from 'vue';
import { TextContent, TextContentProps } from './textbox';
import { SetupComponentOptions } from './types';
import { transitionedColor } from './use';
import { linear } from 'mutate-animate';
import { Background, Selection } from './misc';
import { GameUI, IUIMountable } from '@motajs/system-ui';

export interface InputProps extends DefaultProps, Partial<TextContentProps> {
    /** 输入框的提示内容 */
    placeholder?: string;
    /** 输入框的值 */
    value?: string;
    /** 是否是多行输入，多行输入时，允许换行 */
    multiline?: boolean;
    /** 边框颜色 */
    border?: string;
    /** 边框圆角 */
    circle?: RectRCircleParams;
    /** 边框宽度 */
    borderWidth?: number;
    /** 内边距 */
    pad?: number;
}

export type InputEmits = {
    /**
     * 当输入框的值被确认时触发，例如失焦时
     * @param value 输入框的值
     */
    change: (value: string) => void;

    /**
     * 当输入框的值发生改变时触发，例如输入了一个字符，或者删除了一个字母
     * @param value 输入框的值
     */
    input: (value: string) => void;

    'update:value': (value: string) => void;
};

const inputProps = {
    props: ['placeholder', 'value', 'multiline'],
    emits: ['change', 'input', 'update:value']
} satisfies SetupComponentOptions<InputProps, InputEmits, keyof InputEmits>;

/**
 * 输入组件，点击后允许编辑。参数参考 {@link InputProps}，事件参考 {@link InputEmits}。
 * 完全继承 TextContent 组件的参数，用于控制输入内容的显示方式。用法示例：
 * ```tsx
 * const inputValue = ref('');
 * <Input
 *   placeholder="提示词"
 *   // 双向数据绑定，当输入内容改变时，inputValue 会同时改变
 *   v-model={inputValue.value}
 *   // 设置为多行模式
 *   multiline
 *   // 边框颜色
 *   border="#eee"
 *   // 圆角参数，与 g-rectr 参数一致
 *   circle={[4]}
 *   // 边框宽度
 *   borderWidth={3}
 *   // 内边距
 *   pad={8}
 * />
 * ```
 */
export const Input = defineComponent<InputProps, InputEmits, keyof InputEmits>(
    (props, { attrs, emit }) => {
        let ele: HTMLInputElement | HTMLTextAreaElement | null = null;

        const value = ref(props.value ?? '');
        const root = ref<Container>();

        const width = computed(() => props.loc?.[2] ?? 200);
        const height = computed(() => props.loc?.[3] ?? 200);
        const showText = computed(() => value.value || props.placeholder || '');
        const padding = computed(() => props.pad ?? 4);
        const textLoc = computed<ElementLocator>(() => [
            padding.value,
            padding.value,
            width.value - padding.value * 2,
            height.value - padding.value * 2
        ]);

        const borderColor = transitionedColor(
            props.border ?? '#ddd',
            200,
            linear()
        )!;

        const listenInput = () => {
            if (!ele) return;
            ele.addEventListener('input', () => {
                if (ele) {
                    updateInput(ele.value);
                }
            });
            ele.addEventListener('change', () => {
                if (ele) {
                    updateValue(ele.value);
                }
            });
            ele.addEventListener('blur', () => {
                ele?.remove();
            });
        };

        const createInput = (mul: boolean) => {
            if (mul) {
                ele = document.createElement('textarea');
            } else {
                ele = document.createElement('input');
            }
            // See file://./../../../../../src/styles.less
            ele.classList.add('motajs-input-element');
            listenInput();
        };

        const updateValue = (newValue: string) => {
            value.value = newValue;
            emit('update:value', newValue);
            emit('change', newValue);
        };

        const updateInput = (newValue: string) => {
            value.value = newValue;
            emit('update:value', newValue);
            emit('input', newValue);
        };

        const click = () => {
            if (!ele) createInput(props.multiline ?? false);
            if (!ele) return;
            // 计算当前绝对位置
            const renderer = MotaRenderer.get('render-main');
            const canvas = renderer?.getCanvas();
            if (!canvas) return;
            const chain: RenderItem[] = [];
            let now: RenderItem | undefined = root.value;
            if (!now) return;
            while (now) {
                chain.unshift(now);
                now = now.parent;
            }
            const { clientLeft, clientTop } = canvas;
            const trans = new Transform();
            const scale = chain[0]?.getScale() ?? 1;
            trans.translate(clientLeft, clientTop);
            trans.scale(scale);
            for (const item of chain) {
                const { anchorX, anchorY, width, height } = item;
                trans.translate(-anchorX * width, -anchorY * height);
                trans.multiply(item.transform);
            }
            trans.translate(padding.value, padding.value);
            const [a, b, , c, d, , e, f] = trans.mat;
            const str = `matrix(${a},${b},${c},${d},${e},${f})`;
            const w = width.value * scale;
            const h = height.value * scale;
            const font = props.font ?? Font.defaults();
            ele.style.transform = str;
            ele.style.width = `${w - padding.value * 2}px`;
            ele.style.height = `${h - padding.value * 2}px`;
            ele.style.font = font.string();
            ele.style.color = String(props.fillStyle ?? 'white');
            document.body.appendChild(ele);
            ele.focus();
        };

        const enter = () => {
            borderColor.set('#0ff');
        };

        const leave = () => {
            borderColor.set(props.border ?? '#ddd');
        };

        watch(
            () => props.value,
            newValue => {
                value.value = newValue ?? '';
            }
        );

        watch(
            () => props.multiline,
            value => {
                createInput(value ?? false);
            },
            {
                immediate: true
            }
        );

        onUnmounted(() => {
            ele?.remove();
        });

        return () => (
            <container
                ref={root}
                cursor="text"
                onClick={click}
                onEnter={enter}
                onLeave={leave}
            >
                <g-rectr
                    loc={[0, 0, width.value, height.value]}
                    circle={props.circle}
                    lineWidth={props.borderWidth}
                    strokeStyle={borderColor.ref.value}
                    zIndex={10}
                />
                <TextContent
                    {...attrs}
                    noevent
                    loc={textLoc.value}
                    width={width.value - padding.value * 2}
                    text={showText.value}
                    alpha={value.value.length === 0 ? 0.6 : 1}
                    zIndex={0}
                />
            </container>
        );
    },
    inputProps
);

export interface InputBoxProps extends TextContentProps {
    loc: ElementLocator;
    input?: InputProps;
    color?: CanvasStyle;
    border?: CanvasStyle;
    pad?: number;
    inputHeight?: number;
    text?: string;
    yesText?: string;
    noText?: string;
    selFont?: Font;
    selFill?: CanvasStyle;
}

export type InputBoxEmits = {
    /**
     * 当确认输入框的内容时触发
     * @param value 输入框的内容
     */
    confirm: (value: string) => void;

    /**
     * 当取消时触发
     * @param value 输入框的内容
     */
    cancel: (value: string) => void;
} & InputEmits;

const inputBoxProps = {
    props: [
        'loc',
        'input',
        'color',
        'border',
        'pad',
        'inputHeight',
        'text',
        'yesText',
        'noText',
        'selFont',
        'selFill',
        'width'
    ],
    emits: ['confirm', 'cancel', 'change', 'input', 'update:value']
} satisfies SetupComponentOptions<
    InputBoxProps,
    InputBoxEmits,
    keyof InputBoxEmits
>;

/**
 * 输入框组件，与 2.x 的 myconfirm 类似，单次调用参考 {@link getInput}。用法与 `ConfirmBox` 类似。
 * 参数参考 {@link InputBoxProps}，事件参考 {@link InputBoxEmits}，用例如下：
 * ```tsx
 * const onConfirm = (value: string) => console.log(value);
 *
 * <ConfirmBox
 *   text="请输入文本："
 *   width={240}
 *   // 输入框会自动计算宽度和高度，因此不需要手动指定，即使手动指定也无效
 *   loc={[240, 240, void 0, void 0, 0.5, 0.5]}
 *   // 使用 winskin 图片作为背景
 *   winskin="winskin.png"
 *   // 使用颜色作为背景和边框，如果设置了 winskin，那么此参数无效
 *   color="#333"
 *   border="gold"
 *   // 设置选项的字体
 *   selFont={new Font('Verdana', 16)}
 *   // 设置选项的文本颜色
 *   selFill="#d48"
 *   // 完全继承 TextContent 的参数，因此可以填写 font 参数指定文本字体
 *   font={new Font('arial')}
 *   onConfirm={onYes}
 *   // 可以使用 input 参数调整输入组件
 *   input={{
 *     // 例如在输入组件中添加占位符（未输入任何东西时显示此内容）
 *     placeholder: '在这里输入你的文本'
 *   }}
 * />
 * ```
 */
export const InputBox = defineComponent<
    InputBoxProps,
    InputBoxEmits,
    keyof InputBoxEmits
>((props, { attrs, emit }) => {
    const contentHeight = ref(0);
    const value = ref('');
    const selected = ref(false);
    const yesSize = ref<[number, number]>([0, 0]);
    const noSize = ref<[number, number]>([0, 0]);
    const height = ref(200);

    const yesText = computed(() => props.yesText ?? '确认');
    const noText = computed(() => props.noText ?? '取消');
    const text = computed(() => props.text ?? '请输入内容：');
    const padding = computed(() => props.pad ?? 8);
    const inputHeight = computed(() => props.inputHeight ?? 16);
    const inputLoc = computed<ElementLocator>(() => [
        padding.value,
        padding.value * 2 + contentHeight.value,
        props.width - padding.value * 2,
        inputHeight.value - padding.value * 2
    ]);
    const yesLoc = computed<ElementLocator>(() => {
        const y = height.value - padding.value;
        return [props.width / 3, y, void 0, void 0, 0.5, 1];
    });
    const noLoc = computed<ElementLocator>(() => {
        const y = height.value - padding.value;
        return [(props.width / 3) * 2, y, void 0, void 0, 0.5, 1];
    });
    const selectionLoc = computed<ElementLocator>(() => {
        if (selected.value) {
            const [x = 0, y = 0] = yesLoc.value;
            const [width, height] = yesSize.value;
            return [x, y + 4, width + 8, height + 8, 0.5, 1];
        } else {
            const [x = 0, y = 0] = noLoc.value;
            const [width, height] = noSize.value;
            return [x, y + 4, width + 8, height + 8, 0.5, 1];
        }
    });

    const updateHeight = (h: number) => {
        contentHeight.value = h;
        height.value = h + inputHeight.value + padding.value * 4;
    };

    const change = (value: string) => {
        emit('change', value);
    };

    const input = (value: string) => {
        emit('update:value', value);
        emit('input', value);
    };

    const setYes = (_: string, width: number, height: number) => {
        yesSize.value = [width, height];
    };

    const setNo = (_: string, width: number, height: number) => {
        noSize.value = [width, height];
    };

    const confirm = () => {
        emit('confirm', value.value);
    };

    const cancel = () => {
        emit('cancel', value.value);
    };

    return () => (
        <container>
            <Background
                loc={[0, 0, props.width, height.value]}
                color={props.color}
                border={props.border}
                zIndex={0}
            />
            <TextContent
                {...attrs}
                loc={[padding.value, padding.value]}
                text={text.value}
                width={props.width - padding.value * 2}
                zIndex={5}
                onUpdateHeight={updateHeight}
            />
            <Input
                {...(props.input ?? {})}
                loc={inputLoc.value}
                v-model={value.value}
                zIndex={10}
                onChange={change}
                onInput={input}
            />
            <Selection
                loc={selectionLoc.value}
                border={props.border}
                noevent
                zIndex={10}
            />
            <text
                loc={yesLoc.value}
                text={yesText.value}
                fillStyle={props.selFill}
                font={props.selFont}
                cursor="pointer"
                zIndex={15}
                onClick={confirm}
                onEnter={() => (selected.value = true)}
                onSetText={setYes}
            />
            <text
                loc={noLoc.value}
                text={noText.value}
                fillStyle={props.selFill}
                font={props.selFont}
                cursor="pointer"
                zIndex={15}
                onClick={cancel}
                onEnter={() => (selected.value = false)}
                onSetText={setNo}
            />
        </container>
    );
}, inputBoxProps);

/**
 * 弹出一个输入框，然后将结果返回：
 * ```ts
 * const value = await getInput(
 *   // 在哪个 UI 控制器上打开，对于一般 UI 组件来说，直接填写 props.controller 即可
 *   props.controller,
 *   // 提示内容
 *   '请输入文本：',
 *   // 输入框的位置，宽度由下一个参数指定，高度参数由组件内部计算得出，指定无效
 *   [240, 240, void 0, void 0, 0.5, 0.5],
 *   // 宽度设为 240
 *   240,
 *   // 可以给选择框传入其他的 props，例如指定字体，此项可选
 *   { font: new Font('Verdana', 20) }
 * );
 * // 之后，就可以根据 value 来执行不同的操作了
 * console.log(value); // 输出用户输入的内容
 * ```
 * @param controller UI 控制器
 * @param text 确认文本内容
 * @param loc 确认框的位置
 * @param width 确认框的宽度
 * @param props 额外的 props，参考 {@link ConfirmBoxProps}
 */
export function getInput(
    controller: IUIMountable,
    text: string,
    loc: ElementLocator,
    width: number,
    props?: InputBoxProps
) {
    return new Promise<string>(res => {
        const instance = controller.open(
            InputBoxUI,
            {
                ...(props ?? {}),
                text,
                loc,
                width,
                onConfirm: value => {
                    controller.close(instance);
                    res(value);
                },
                onCancel: () => {
                    controller.close(instance);
                    res('');
                }
            },
            true
        );
    });
}

/**
 * 与 `getInput` 类似，不过会将结果转为数字。用法参考 {@link getInput}
 */
export async function getInputNumber(
    controller: IUIMountable,
    text: string,
    loc: ElementLocator,
    width: number,
    props?: InputBoxProps
) {
    const value = await getInput(controller, text, loc, width, props);
    return parseFloat(value);
}

export const InputBoxUI = new GameUI('input-box', InputBox);
