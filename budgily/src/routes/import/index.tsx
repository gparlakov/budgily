import { $, Signal, component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';

import { Form } from '@builder.io/qwik-city';

import { SelectLocale } from 'budgily/src/components/select-locale/select-locale';
import { DocumentSignature, getXmlDocumentSignature } from './document-signature';
import { Parsed, readAndParseFiles, recognizeLocale } from './reader';
import { SelectOne, SelectTransaction, SelectedLocale } from './visualizer';
import { Button } from '@qwik-ui/tailwind';
import { WizardCrumb, WizardStep, WizardV2, WizardTitle, next, WizardContext, emptyContext } from 'budgily/src/components/wizard/wizard.v2';

export default component$(() => {
  const { crumb, step, title } = next();
  const filesInput = useSignal<HTMLInputElement>();
  const state = useStore<{
    selectedLocale?: string;
    recognizedLocales?: Record<string, Record<string, Parsed>>;
    signature?: DocumentSignature;
    files: Document[],
    selectedTag?: string,
    wiz: WizardContext
  }>({ files: [], wiz: emptyContext });


  return <WizardV2 steps={5} referenceWizardContext={state.wiz} useCustomActions={true} >

    <WizardCrumb {...crumb()}>Select File</WizardCrumb>
    <WizardCrumb {...crumb()}>Select one movement</WizardCrumb>
    <WizardCrumb {...crumb()}>Select locale</WizardCrumb>
    <WizardCrumb {...crumb()}>Confirm</WizardCrumb>
    <WizardCrumb {...crumb()}>Conf</WizardCrumb>

    <WizardTitle  {...title()}>Select File</WizardTitle>
    <WizardStep {...step()} >
      <Form>
        <div class="form-control">
          <label class="label"><span class="label-text">Import from a file (only .xml)</span></label>
          <input ref={filesInput} onChange$={() => {
            filesInput.value && readAndParseFiles(filesInput.value).then(docs => {
              state.files = docs;
              state.signature = getXmlDocumentSignature(state.files[0]);
              state.wiz.next$();
            });
          }} name="file" accept=".xml" type="file" placeholder="Input from a file" class={`file-input w-full ${false ? 'file-input-warning' : ''} `} />
        </div>

        <div class="divider">or</div>
        <div class="form-control">
          <textarea name="raw" placeholder="Copy paste raw contents here" rows={10} class={`textarea textarea-bordered ${false ? 'file-input-warning' : ''}`}></textarea>
          {false && <label class="label"><span class="label-text text-warning">Please add some text</span></label>}
        </div>
      </Form>
    </WizardStep>


    <WizardTitle  {...title()}>Select one movement</WizardTitle>
    <WizardStep {...step()} > <SelectTransaction
      file={state.files[0]}
      signature={state.signature!}
      onSelected$={$((selectedTag: string) => {
        state.selectedTag = selectedTag;
        state.recognizedLocales = recognizeLocale(state.files[0].documentElement.getElementsByTagName(selectedTag)[0]);
        state.wiz.next$();
      })} />
    </WizardStep>

    <WizardTitle  {...title()}>Confirm</WizardTitle>
    <WizardStep {...step()} >
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


    <WizardTitle  {...title()}>Select locale</WizardTitle>
    <WizardStep {...step()} > <SelectLocale
      preferred={state.recognizedLocales ? Object.keys(state.recognizedLocales) : undefined}
      onSelect$={(l: string) => { state.selectedLocale = l; }}
    />
      {state.selectedLocale
        ? <SelectedLocale file={state.files[0]} signature={state.signature} recognized={state.recognizedLocales![state.selectedLocale!]} />
        : <>Please select a locale because we need it to recognize the date and number local formats.</>
      }

      <Button onClick$={() => state.wiz.next$()} class="color-success">Confirm</Button>
    </WizardStep>

    {/* <WizardTitle  {...title()}>Conf</WizardTitle>
    <WizardStep {...step()} > <>
      <div>Selected tag for 1 movement: {state.selectedTag}</div>
      <div>Movements: {state.signature?.tagNameCounts[state.selectedTag!]}</div>
        // how many movements
      // how many duplicates
      // what is the min date and the max date
      // any re-imported movements will replace the ones in the DB ()
      <div class="form-control mt-6">
        <button class="btn btn-primary">Import</button>
      </div>
    </></WizardStep> */}
  </WizardV2>
});


