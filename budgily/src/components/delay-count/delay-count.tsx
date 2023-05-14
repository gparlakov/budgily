import { component$, useStore, useTask$ } from '@builder.io/qwik';
import { ButtonGroup, Accordion, AccordionItem, Badge, Breadcrumb, BreadcrumbItem } from '@qwik-ui/headless';
import { Combobox, ComboboxItem } from '../combobox/combobox';

interface AppStore {
  count: number;
  delayCount: number;
}
export default component$(() => {
  const store = useStore({
    count: 0,
    delayCount: 0,
  });
  console.log('Render: <App>');
  useTask$(({ track }) => {
    track(() => store.count);
    const id = setTimeout(() => (store.delayCount = store.count), 2000);
    return () => clearTimeout(id);
  });
  return (
    <>
      <DisplayCount store={store} />
      <DisplayDelayCount store={store} />
        <button onClick$={() => store.count++}>+1</button>
        <Combobox input={{placeholder: 'Test'}}>
          <ComboboxItem onClick$={() => alert('1')}>Test 1</ComboboxItem>
          <ComboboxItem onClick$={() => alert('2')}>Test 2</ComboboxItem>
        </Combobox>
    </>
  );
});

export const DisplayCount = component$((props: { store: AppStore }) => {
  console.log('Render: <DisplayA>');
  return <>{props.store.count}</>;
});

export const DisplayDelayCount = component$((props: { store: AppStore }) => {
  console.log('Render: <DisplayB>');
  return <>{props.store.delayCount}</>;
});
