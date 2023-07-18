import { component$, useSignal, useStore, $ } from '@builder.io/qwik';

import { Form } from '@builder.io/qwik-city';
import { readAndParseFiles } from './reader';
import { SelectTransaction } from './visualizer';
import { DocumentSignature, getXmlDocumentSignature } from './document-signature';

export default component$(() => {

  const filesInput = useSignal<HTMLInputElement>();
  const state = useStore<{
    signature?: DocumentSignature;
    files: Document[],
    step: number,
    selectedTag?: string
}>({ files: [], step: 0 });

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
        </div>
        <div class="card w-full shadow-2xl bg-base-100">
          <div class="card-body">

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

