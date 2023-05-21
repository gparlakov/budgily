import { component$, useStore, useTask$ } from '@builder.io/qwik';

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
      <button onClick$={() => store.count++} class="mt-3 inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">+1</button>
      <DisplayCount store={store} />
      <DisplayDelayCount store={store} />
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
