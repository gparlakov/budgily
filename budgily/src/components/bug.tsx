import { component$, useStore, useResource$, Resource } from '@builder.io/qwik';

export default component$(() => {
  const store = useStore({ count: 0 });

  const count = useResource$(({ track }) => {
    track(store);
    return Promise.resolve(store.count);
  })

  return (
    <main>
      <Resource value={count} onResolved={(count) => <ChildUsingStore store={store} />} />
      <ChildUpdatingStore store={store}/>
    </main>
  );
});

export type PropsWithStore = {
  store: {
    count: number;
  }
}

export const ChildUsingStore = component$(({ store }: PropsWithStore) => <>{store.count}</>)

export const ChildUpdatingStore = component$(({ store }: PropsWithStore) => <p>
  <button onClick$={() => store.count++}>Click</button>
</p>)
