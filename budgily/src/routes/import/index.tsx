import { component$, useSignal, useStore } from '@builder.io/qwik';

import { Form } from '@builder.io/qwik-city';
import { readAndParseFiles, visualizeFirstUniqueTagName } from './reader';


export default component$(() => {

  const filesInput = useSignal<HTMLInputElement>();
  const files = useStore<{filesLoaded: boolean, files: Document[]}>({filesLoaded: false, files: []});

  return <div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
    <div class="text-sm breadcrumbs">
      <ul>
        <li><a>Home</a></li>
        <li><a>Documents</a></li>
        <li>Add Document</li>
      </ul>
    </div>
      <div class="text-center lg:text-left">
        <h1 class="text-5xl font-bold">Import bank statement</h1>
        <p class="py-6">Import from a file or drop the text below</p>
        {files.filesLoaded && files.files.map((f, i) => <div key={i} dangerouslySetInnerHTML={(visualizeFirstUniqueTagName(f), f.documentElement.innerHTML)}></div>)}
      </div>
      <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <div class="card-body">

          <Form >
            <div class="form-control">
              <label class="label"><span class="label-text">Import from a file</span></label>
              <input ref={filesInput} onChange$={() => {filesInput.value && readAndParseFiles(filesInput.value).then(docs => {
                files.filesLoaded = true;
                files.files = docs;
              })}} name="file" accept=".xml,.csv,.json" type="file" placeholder="Input from a file" class={`file-input w-full max-w-xs ${false ? 'file-input-warning' : ''} `} />
            </div>

            <div class="divider">or</div>
            <div class="form-control">
              <textarea name="raw" placeholder="Copy paste raw contents here" rows={10} class={`textarea textarea-bordered ${false ? 'file-input-warning' : ''}`}></textarea>
              {false && <label class="label"><span class="label-text text-warning">Please add some text</span></label>}
            </div>
            <div class="form-control mt-6">
              <button class="btn btn-primary">Import</button>
            </div>
            {!false && <div class="text-warning">{JSON.stringify({})}</div>}
          </Form>
        </div>
      </div>
    </div>
  </div>;
});

