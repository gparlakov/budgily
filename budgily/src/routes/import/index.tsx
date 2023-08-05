import { $, component$, useSignal, useStore } from '@builder.io/qwik';

import { Form } from '@builder.io/qwik-city';

import { SelectLocale } from 'budgily/src/components/select-locale/select-locale';
import { DocumentSignature, getXmlDocumentSignature } from './document-signature';
import { Parsed, readAndParseFiles, recognizeLocale } from './reader';
import { SelectOne, SelectTransaction, SelectedLocale } from './visualizer';
import { Button } from '@qwik-ui/tailwind';
import { WizardCrumb, WizardStep, WizardV2, WizardTitle, slot } from 'budgily/src/components/wizard/wizard.v2';


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


  return <WizardV2 steps={5} >

    {/* crumbs will show up on top */}
    <WizardCrumb step={0} q: slot={slot.crumb(0)}>Select File</WizardCrumb>
    <WizardCrumb step={1} q: slot={slot.crumb(1)}>Select one movement</WizardCrumb>
    <WizardCrumb step={2} q: slot={slot.crumb(2)}>Select locale</WizardCrumb>
    <WizardCrumb step={3} q: slot={slot.crumb(3)}>Confirm</WizardCrumb>
    <WizardCrumb step={4} q: slot={slot.crumb(4)}>Conf</WizardCrumb>

    <WizardTitle step={0} q: slot={slot.crumb(0)}>Select File</WizardTitle>
    <WizardStep q: slot={slot.step(0)} step={0}> <SelectFile filesInput={filesInput} state={state} /></WizardStep>


    <WizardTitle step={1} q: slot={slot.crumb(1)}>Select one movement</WizardTitle>
    <WizardStep q: slot={slot.step(1)} step={1}> <SelectTransaction
      file={state.files[0]}
      signature={state.signature!}
      onSelected$={$((selectedTag: string) => {
        state.selectedTag = selectedTag;
        state.step += 1;
        state.recognizedLocales = recognizeLocale(state.files[0].documentElement.getElementsByTagName(selectedTag)[0]);
      })} />
    </WizardStep>

    <WizardTitle step={2} q: slot={slot.crumb(2)}>Select locale</WizardTitle>
    <WizardStep q: slot={slot.step(2)} step={2}> <SelectLocale
      preferred={state.recognizedLocales ? Object.keys(state.recognizedLocales) : undefined}
      onSelect$={(l: string) => { state.selectedLocale = l; }}
    />
      {state.selectedLocale && <SelectedLocale file={state.files[0]} signature={state.signature} recognized={state.recognizedLocales![state.selectedLocale!]}></SelectedLocale>}

      <Button onClick$={() => state.step += 1} class="color-success">Confirm</Button>
    </WizardStep>

    <WizardTitle step={3} q: slot={slot.crumb(3)}>Confirm</WizardTitle>
    <WizardStep q: slot={slot.step(3)} step={3}>
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
    </WizardStep>

    <WizardTitle step={4} q: slot={slot.crumb(4)}>Conf</WizardTitle>
    <WizardStep q: slot={slot.step(4)} step={4}> <>
      <div>Selected tag for 1 movement: {state.selectedTag}</div>
      <div>Movements: {state.signature?.tagNameCounts[state.selectedTag!]}</div>
        // how many movements
      // how many duplicates
      // what is the min date and the max date
      // any re-imported movements will replace the ones in the DB ()
      <div class="form-control mt-6">
        <button class="btn btn-primary">Import</button>
      </div>
    </></WizardStep>
  </WizardV2>
});
function SelectFile(filesInput, state: { selectedLocale?: string | undefined; recognizedLocales?: Record<string, Record<string, Parsed>> | undefined; signature?: DocumentSignature | undefined; files: Document[]; step: number; selectedTag?: string | undefined; }) {
  return <Form>
    <div class="form-control">
      <label class="label"><span class="label-text">Import from a file (only .xml)</span></label>
      <input ref={filesInput} onChange$={() => {
        filesInput.value && readAndParseFiles(filesInput.value).then(docs => {
          state.files = docs;
          state.step++;
          state.signature = getXmlDocumentSignature(state.files[0]);
        });
      }} name="file" accept=".xml" type="file" placeholder="Input from a file" class={`file-input w-full ${false ? 'file-input-warning' : ''} `} />
    </div>

    <div class="divider">or</div>
    <div class="form-control">
      <textarea name="raw" placeholder="Copy paste raw contents here" rows={10} class={`textarea textarea-bordered ${false ? 'file-input-warning' : ''}`}></textarea>
      {false && <label class="label"><span class="label-text text-warning">Please add some text</span></label>}
    </div>
    {!false && <div class="text-warning">{JSON.stringify({})}</div>}
  </Form>;
}

