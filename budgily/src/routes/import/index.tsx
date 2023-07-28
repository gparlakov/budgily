import { $, component$, useSignal, useStore } from '@builder.io/qwik';

import { Form } from '@builder.io/qwik-city';

import { SelectLocale } from 'budgily/src/components/select-locale/select-locale';
import { DocumentSignature, getXmlDocumentSignature } from './document-signature';
import { Parsed, readAndParseFiles, recognizeLocale } from './reader';
import { SelectOne, SelectTransaction, SelectedLocale } from './visualizer';
import { Button } from '@qwik-ui/tailwind';
import { Wizard } from 'budgily/src/components/wizard/wizard';


export default component$(() => {

  const filesInput = useSignal<HTMLInputElement>();
  const state = useStore<{
    selectedLocale?: string;
    recognizedLocales?: Record<string, Record<string, Parsed>>;
    signature?: DocumentSignature;
    files: Document[],
    step: number,
    selectedTag?: string
  }>({ files: [], step: 0 });


  const crumb1 = component$(() => <>'Select File'</>)

  const crumb2 = component$(() => <>'Select one movement'</>);
  const crumb3 = component$(() => <>'Select locale'</>);
  const crumb4 = component$(() => <>'Confirm'</>);
  const crumb5 = component$(() => <>'Conf'</>);

  const Step1 = component$(() => <><Form >
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
  </Form></>)

  const Step2 = component$(() => <SelectTransaction
    file={state.files[0]}
    signature={state.signature!}
    onSelected$={$((selectedTag: string) => {
      state.selectedTag = selectedTag;
      state.step += 1;
      state.recognizedLocales = recognizeLocale(state.files[0].documentElement.getElementsByTagName(selectedTag)[0]);
    })} />
  )

  const Step3 = component$(() => <><SelectLocale
    preferred={state.recognizedLocales ? Object.keys(state.recognizedLocales) : undefined}
    onSelect$={(l: string) => { state.selectedLocale = l; }}
  />
    {state.selectedLocale && <SelectedLocale file={state.files[0]} signature={state.signature} recognized={state.recognizedLocales![state.selectedLocale!]}></SelectedLocale>}

    <Button onClick$={() => state.step += 1} class="color-success">Confirm</Button>
  </>)

  const Step4 = component$(() => <>
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
  </>)

  const Step5 = component$(() => <>
    <div>Selected tag for 1 movement: {state.selectedTag}</div>
    <div>Movements: {state.signature?.tagNameCounts[state.selectedTag!]}</div>
          // how many movements
    // how many duplicates
    // what is the min date and the max date
    // any re-imported movements will replace the ones in the DB ()
    <div class="form-control mt-6">
      <button class="btn btn-primary">Import</button>
    </div>
  </>)

  return <Wizard

    crumbs={[crumb1, crumb2, crumb3, crumb4, crumb5]}

    // titles={[
    //   component$(() => <><h1 class="text-5xl font-bold">Import bank statement</h1><p class="text-2x py-6">Import from a file or drop the text below</p></>),
    //   component$(() => <>
    //     <h1 class="text-5xl font-bold">One transaction</h1>
    //     <h2 class="text-2xl py-6">Please select one transaction below.</h2>
    //   </>),
    //   component$(() => <>
    //     <h1 class="text-5xl font-bold">Recognizing</h1>
    //     <h2 class="text-2xl py-6">We recognized {Object.keys(state.recognizedLocales).length}. Please confirm locale selection.</h2>
    //   </>)]}

    steps={[Step1, Step2, Step3, Step4, Step5]}
  />
});
