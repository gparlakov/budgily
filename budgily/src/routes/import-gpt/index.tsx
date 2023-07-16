import { component$ } from '@builder.io/qwik';

import { Form, routeAction$, z, zod$ } from '@builder.io/qwik-city';
export const useAddUser = routeAction$(
  async (input, requestEvent) => {
    const importViaGPT = await import('@codedoc1/budgily-api').then(c => c.importViaGPT);
    // console.log(input)
    const textProm = 'file' in input ? input.file.text() : input.raw;
    const text = await textProm;

    return importViaGPT(text).then(v => {
      console.log('------ result',v)
      return { success: v?.error == null && v?.result != null, result: v?.result, ...(v?.error ?? {}) }
    });
  },

  // either file or raw
  zod$(
    z.object({
      file: z.instanceof(Blob, { message: 'Nothing to import' }).refine(file => file.size > 0, 'empty file')
    })
      .or(
        z.object({
          raw: z.string().min(1, { message: 'Nothing to import' })
        })
      )
  )
);


export default component$(() => {
  const action = useAddUser();
  return <div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="text-center lg:text-left">
        <h1 class="text-5xl font-bold">Import bank statement</h1>
        <p class="py-6">Import from a file or drop the text below</p>
      </div>
      <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <div class="card-body">

          <Form action={action}>
            <div class="form-control">
              <label class="label"><span class="label-text">Import from a file</span></label>
              <input name="file" type="file" placeholder="Input from a file" class={`file-input w-full max-w-xs ${action.value?.fieldErrors?.file ? 'file-input-warning' : ''} `} />
              {action.value?.fieldErrors?.file && <label class="label"><span class="label-text text-warning">Please select a file</span></label>}
            </div>

            <div class="divider">or</div>
            <div class="form-control">
              <textarea name="raw" placeholder="Copy paste raw contents here" rows={10} class={`textarea textarea-bordered ${action.value?.fieldErrors?.raw ? 'file-input-warning' : ''}`}></textarea>
              {action.value?.fieldErrors?.raw && <label class="label"><span class="label-text text-warning">Please add some text</span></label>}
            </div>
            <div class="form-control mt-6">
              <button class="btn btn-primary">Import</button>
            </div>
            {!action.value?.success && <div class="text-warning">{JSON.stringify(action.value?.original)}</div>}
          </Form>
        </div>
      </div>
    </div>
  </div>;
});
