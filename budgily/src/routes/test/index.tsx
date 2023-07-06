import { component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { getCategories, doCategorize } from '../../server';
import { Category } from '../../server/types';

export default component$(() => {

    const store = useStore<{ cats: Category[], loading?: boolean }>({ cats: [], loading: true })
    useVisibleTask$(async () => {
        store.cats = await getCategories()
        store.loading = false;
        // doCategorize({categoryId: 1, movementIds: []})
    })
    const checked = useSignal<boolean>(true)
    return <>
        {store.loading
            ? <div>loading</div>
            : <div class="block" >{
                store.cats.map(c => <label class="swap">
                    <input type="checkbox" bind: checked={checked} />
                    <div class="swap-on">{c.name}</div>
                    <div class="swap-off">{`${c.movementIds.length ?? 0} movements`}</div>
                </label>)
            }</div>
        }

    </>
})
