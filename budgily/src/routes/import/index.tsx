import { component$, useSignal, useStore, $ } from '@builder.io/qwik';

import { Form } from '@builder.io/qwik-city';


import { SelectLocale } from '../../components/select-locale/select-locale';
import { readAndParseFiles } from './reader';
import { SelectOne, SelectTransaction } from './visualizer';
import { DocumentSignature, getXmlDocumentSignature } from './document-signature';

type LocaleStore = {
  num: string;
  date: string
  selected: true;
}
type Empty = {
  selected: false;
}

export default component$(() => {

  const filesInput = useSignal<HTMLInputElement>();
  const state = useStore<{
    signature?: DocumentSignature;
    files: Document[],
    step: number,
    selectedTag?: string
  }>({ files: [], step: 0 });

  const localState = useStore<LocaleStore | Empty>({selected: false});

  return <div class="hero min-h-screen w-full bg-base-200">
    <div class="hero-content w-full">

      <div class="w-full">
        <div class="text-sm breadcrumbs">
          <ul>
            <li class={state.step === 0 ? 'active' : ''}><a onClick$={() => state.step = 0}>Select File</a></li>
            {state.step >= 1 && <li class={state.step === 1 ? 'active' : ''}><a onClick$={() => state.step = 1}>Mapping to a movement</a></li>}
            {state.step >= 2 && <li class={state.step === 2 ? 'active' : ''}><a onClick$={() => state.step = 2}>Import it</a></li>}
          </ul>
        </div>
        <div class="text-center">

          {state.step === 0 && <><h1 class="text-5xl font-bold">Import bank statement</h1><p class="text-2x py-6">Import from a file or drop the text below</p></>}
          {state.step === 1 && <>
            <h1 class="text-5xl font-bold">One transaction</h1>
            <h2 class="text-2xl py-6">Please select one transaction below.</h2>
          </>}
          {state.step === 2 && <>
            <h1 class="text-5xl font-bold">Select the Amount</h1>
            <h2 class="text-2xl py-6">Select the amount.</h2>
          </>}
        </div>
        <div class="card w-full shadow-2xl bg-base-100">
          <div class="card-body">
            <SelectLocale onSelect$={(v) => {
              localState.selected = true;
              if(localState.selected) {
                // just for TS ^^^ - we know it's true b/c we just set it but TS needs an if to reconsider the type
                localState.num = (new Intl.NumberFormat(v)).format(1234567.89);
                localState.date = (new Intl.DateTimeFormat(v)).format(new Date(2023, 6, 25))

                new Intl.DateTimeFormat(v).formatToParts(new Date(2023, 6, 7)).forEach(f => console.log(f))
              }
            }}/>
            {localState.selected && <div>
              <div>Number 1234567.89 =&gt; { localState.num }</div>
              <div>Date 25th of July 2023 =&gt; { localState.date }</div>
            </div>}

            {state.step === 0 && <Form >
              <div class="form-control">
                <label class="label"><span class="label-text">Import from a file (only .xml)</span></label>
                <input ref={filesInput} onChange$={() => {
                  filesInput.value && readAndParseFiles(filesInput.value).then(docs => {
                    state.files = docs;
                    state.step++;
                    state.signature = getXmlDocumentSignature(state.files[0]);
                  })
                }} name="file" accept=".xml" type="file" placeholder="Input from a file" class={`file-input w-full ${false ? 'file-input-warning' : ''} `} />
              </div>

              <div class="divider">or</div>
              <div class="form-control">
                <textarea name="raw" placeholder="Copy paste raw contents here" rows={10} class={`textarea textarea-bordered ${false ? 'file-input-warning' : ''}`}></textarea>
                {false && <label class="label"><span class="label-text text-warning">Please add some text</span></label>}
              </div>
              {!false && <div class="text-warning">{JSON.stringify({})}</div>}
            </Form>}

            {state.step === 1 &&
              <SelectTransaction
                file={state.files[0]}
                signature={state.signature!}
                onSelected$={$((selectedTag: string) => { state.selectedTag = selectedTag; state.step += 1; })} />
            }

            {state.step === 2 && <>
              <SelectOne file={state.files[0]} signature={state.signature!} selectedTag={state.selectedTag!} onSelected$={() => { }} />
              <div>Selected tag for 1 movement: {state.selectedTag}</div>
              <div>Movements: {state.signature?.tagNameCounts[state.selectedTag!]}</div>

              // how many movements
              // how many duplicates
              // what is the min date and the max date
              // any re-imported movements will replace the ones in the DB ()
              <div class="form-control mt-6">
                <button class="btn btn-primary">Import</button>
              </div>
            </>}

            {state.step === 3 && <>
              <div>Selected tag for 1 movement: {state.selectedTag}</div>
              <div>Movements: {state.signature?.tagNameCounts[state.selectedTag!]}</div>
              // how many movements
              // how many duplicates
              // what is the min date and the max date
              // any re-imported movements will replace the ones in the DB ()
              <div class="form-control mt-6">
                <button class="btn btn-primary">Import</button>
              </div>
            </>}
          </div>
        </div>
      </div>

    </div>
  </div>;
});

