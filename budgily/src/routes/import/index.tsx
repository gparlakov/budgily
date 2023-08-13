import { $, component$, useSignal, useStore } from '@builder.io/qwik';

import { Form } from '@builder.io/qwik-city';

import { Button } from '@qwik-ui/tailwind';
import { SelectLocale } from 'budgily/src/components/select-locale/select-locale';
import { WizardContext, WizardCrumb, WizardStep, WizardTitle, WizardV2, emptyContext, next } from 'budgily/src/components/wizard/wizard.v2';
import { DocumentSignature, getXmlDocumentSignature } from '../../core/xml/document-signature';
import { Parsed, readAndParseFiles, recognizeLocale } from '../../core/xml/reader';
import { SelectMovement } from 'budgily/src/components/xml/select-movement';
import { SelectProperties } from 'budgily/src/components/xml/select-properties';

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


  return <WizardV2 steps={4} referenceWizardContext={state.wiz} useCustomActions={true} >

    <WizardCrumb {...crumb()}>Select File</WizardCrumb>
    <WizardCrumb {...crumb()}>Select one movement</WizardCrumb>
    <WizardCrumb {...crumb()}>Select locale</WizardCrumb>
    <WizardCrumb {...crumb()}>Confirm</WizardCrumb>
    {/* <WizardCrumb {...crumb()}>Conf</WizardCrumb> */}

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
    <WizardStep {...step()} > <SelectMovement
      file={state.files[0]}
      signature={state.signature!}
      onSelected$={$((selectedTag: string) => {
        state.selectedTag = selectedTag;
        state.recognizedLocales = recognizeLocale(state.files[0].documentElement.getElementsByTagName(selectedTag)[0]);
        state.selectedLocale = Object.keys(state.recognizedLocales)[0];
        state.wiz.next$();
      })} />
    </WizardStep>

    {/* <WizardTitle  {...title()}>Confirm</WizardTitle>
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
    </WizardStep> */}


    <WizardTitle  {...title()}>Select locale</WizardTitle>
    <WizardStep {...step()} >
      <SelectLocale
        preferred={state.recognizedLocales ? Object.keys(state.recognizedLocales) : undefined}
        selected={state.recognizedLocales ? Object.keys(state.recognizedLocales)[0] : undefined}
        onSelect$={(l: string) => { state.selectedLocale = l; }}
      />
      <SelectProperties file={state.files[0]} signature={state.signature} parsed={state.selectedLocale && state.recognizedLocales ? state.recognizedLocales[state.selectedLocale] : {}} />
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


