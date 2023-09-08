import {
  QwikIntrinsicElements,
  Slot,
  component$,
  useSignal,
  $,
  createContextId,
  useContextProvider,
  useContext,
  QRL,
  Signal,
  useStore,
  useId,
  useVisibleTask$
} from '@builder.io/qwik';

export type ComboboxProps = {
  input?: QwikIntrinsicElements['input'];
  ul?: QwikIntrinsicElements['ul'];
  value?: string;
};

export const comboboxContext = createContextId<ComboboxContext>('combobox-root');

export const useComboboxProvider = (state: ComboboxContext) => useContextProvider(comboboxContext, state);

export const Combobox = component$(({ input, ul, value }: ComboboxProps) => {
  const combobox = useCombobox();
  useComboboxProvider(combobox);

  const toggle = (to: 'on' | 'off') =>
    $(() => {
      combobox.isVisible.value = to === 'on';
    });

  return (
    <>
      <div class="relative inline-block">
        <input
          type="text"
          class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          bind:value={combobox.search}
          onClick$={toggle('on')}
          onKeyDown$={[toggle('on')]}
          onChange$={toggle('on')}
          onInput$={[toggle('on'), $((e: unknown, el: HTMLInputElement) => combobox.updateSearch(el.value))]}
          onFocus$={toggle('on')}
          onBlur$={toggle('off')}
          {...input}
        />
        <ul
          class={`absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-md max-h-48 overflow-y-auto ${''}`}
          {...ul}
        >
          <Slot />
        </ul>
      </div>
    </>
  );
});

export type ComboboxItemProps = QwikIntrinsicElements['li'];
export const ComboboxItem = component$(({ class: classNames, ...props }: ComboboxItemProps) => {
  const ref = useSignal<HTMLElement>();
  const { isVisible, } = useContext(comboboxContext);

  useVisibleTask$(({cleanup}) => {
    // add the item when it's instantiated
    // addItem(ref)

    //
    // cleanup(() => removeItem(ref))
  })
  return (
    <>
      {isVisible.value && (
        <li class={`prfx-combobox-item px-4 py-2 cursor-pointer hover:bg-blue-500 hover:text-white ${classNames}`} {...props} id={useId()} ref={ref}>
          <Slot />
        </li>
      )}
    </>
  );
});

type ComboboxContext = {
  updateSearch: QRL<(s: string) => void>;
  search: Signal<string>;
  isVisible: Signal<boolean>;
  toggle: QRL<(to: 'on' | 'off') => void>;
  setItems: QRL<(items: HTMLElement[]) => void>
  // addItem: QRL<(item: HTMLElement) => void>
  handleKeyPress: QRL<(event: KeyboardEvent, el: HTMLInputElement) => void>
  getNextId: QRL<() => string>
};
export function useCombobox(): ComboboxContext {
  const search = useSignal<string>('');
  const isVisible = useSignal(false);

  const items = useStore<HTMLElement[]>([]);
  const selected = useSignal();
  return {
    search,
    updateSearch: $((s: string) => {
      search.value = s;
    }),

    isVisible,
    toggle: $((to) => {
      isVisible.value = to === 'on';
    }),

    setItems: $(is => {
      items.splice(0, items.length);
      items.push(...is);
    }),
    handleKeyPress: $((e, el) => {
      const isDown = e.key === 'ArrowDown';
      const isUp = e.key === 'ArrowUp';

      if(isUp){
        // selectNext
      }
    }),
    getNextId: $(useId)
  };
}
