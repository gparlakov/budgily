import { QwikIntrinsicElements, Slot, component$ } from '@builder.io/qwik';

export type ComboboxProps = { input?: QwikIntrinsicElements['input']; ul?: QwikIntrinsicElements['ul'] };

export const Combobox = component$(({ input, ul }: ComboboxProps) => {
  return (
    <>
      <div class="relative inline-block">
        <input
          type="text"
          class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          {...input}
        />
        <ul
          class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-md max-h-48 overflow-y-auto"
          {...ul}
        >
          <Slot />
        </ul>
      </div>
    </>
  );
});

export type ComboboxItemProps = QwikIntrinsicElements['li'];
export const ComboboxItem = component$(({ class: classNames, ...props }: ComboboxItemProps) => (
  <li class={`px-4 py-2 cursor-pointer hover:bg-blue-500 hover:text-white ${classNames}`} {...props}>
    <Slot />
  </li>
));
