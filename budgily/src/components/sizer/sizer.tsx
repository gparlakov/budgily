import { $, QRL, component$, useId, useOnWindow, useSignal, useVisibleTask$ } from '@builder.io/qwik';


export type SizerProps = {
  id?: string,
  onSize: QRL<(width: number) => void>,
  debounceTime?: number
}

export const Sizer = component$(({onSize, id, debounceTime}: SizerProps) => {
  const idd = id ?? useId();
  const debounce = debounceTime ?? 100;
  const emitSize = $(() => {
    const el = document.querySelector(`div#${idd}`)
    if(el != null) {
      onSize(el.getBoundingClientRect().width);
    }
  });

  useVisibleTask$(() => {
    // will do only once the first time
    emitSize();
  });

  const t = useSignal<number>();
  useOnWindow(
    'resize',
    $(() => {
      clearTimeout(t.value);
      t.value = setTimeout(emitSize, debounce) as unknown as number;
    })
  );

  return <div id={idd}></div>;
});
