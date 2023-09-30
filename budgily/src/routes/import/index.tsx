import { component$, useSignal, $ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { Form } from '@builder.io/qwik-city';
import { DemoMovement, replaceMovements } from '@codedoc1/budgily-data-client';
import { DSVRowArray, csvParse } from 'd3';

type UnpackPromise<T> = T extends Promise<infer U> ? U : never;

const hintOnCSVContents = `date,amount,type,description,sender,receiver
2023-09-09T15:30:00Z,145.5,credit,a description,My employer,
2023-05-09T15:30:00Z,45.5,debit,rent,,landlord`;

export default component$(() => {

  const imported = useSignal<UnpackPromise<ReturnType<typeof readCSV>>>();
  const navFn = useNavigate();
  const onImport = $(() => imported.value?.success && (replaceMovements(imported.value.success), navFn('/')))

  return <div class="mt-12 hero">

    <div class="hero-content flex-col">

      <h1 class="text-5xl font-bold">Import your account movements</h1>
      <Form >
        <div class="join join-vertical w-full">

          {/* the file input */}
          <div class="form-control join-item">
            <label class="label join join-vertical">
              <span class="join-item border border-primary">Import from a file (only .csv)</span>
              <input onChange$={async (_, input) => imported.value = input.files ? await readCSV(input.files) : undefined} name="file" accept=".csv" type="file"
                placeholder="Input from a csv file" class={`join-item file-input input-bordered border border-primary w-half ${imported.value?.error ? 'file-input-warning' : ''} `} />
            </label>
          </div>

          {/* error missing/empty file */}
          {imported.value?.error === 'CantReadOrParseFile' || imported.value?.error === 'EmptyFile' && <div class="join-item text-error">Please select a file</div>}
          {/* error - missing or invalid columns */}
          {imported.value?.error === 'MissingColumns' && <div class="join-item text-error">Expected csv with columns: <span class="font-bold">{imported.value.expected}</span> <br /> received columns: <span class="font-bold">{imported.value.received}</span></div>}
        </div>

        {!imported.value?.success && <div class="mt-12">
          <h3>Expecting a csv file with the following headers</h3>
          <pre style="background-color: white;  padding: 1rem;  line-height: 2rem;">{hintOnCSVContents}
          </pre>
        </div>}

      </Form>

      {/* The imported movements */}
      {imported.value?.success && <div class="mt-12 w-full">

        {/* header */}
        <h3 class="w-full mx-auto flex gap-20">
          <button class="btn btn-sm btn-accent flex-auto" onClick$={onImport}>Confirm and import</button>
          <div class="flex-auto text-right inline-block align-middle">Read {imported.value.success.length} movements</div>
        </h3>

        {/* column captions */}
        <div class="flex flex-center px-2 py-1">
          <div class="flex-1 font-bold">Date (month)</div>
          <div class="flex-1 font-bold">Amount</div>
          <div class="flex-1 font-bold">Type</div>
          <div class="flex-1 font-bold">Description</div>
        </div>

        {/* rows */}
        {imported.value.success.map(m => <><div class="flex flex-center px-2 py-1">
          <div class="flex-1">{m.date.toLocaleDateString()} ({m.month})</div>
          <div class="flex-1">{m.amount}</div>
          <div class="flex-1">{m.type}</div>
          <div class="flex-1">{m.description}</div>
        </div></>)}

        {/* footer - for a large number of imports add action line at the bottom */}
        {Number(imported.value?.success?.length > 20) && <h3 class="w-full mx-auto flex gap-20">

          <button class="btn btn-sm btn-accent flex-auto" onClick$={onImport}>Confirm and import</button>
          <div class="flex-auto text-right inline-block align-middle">Read {imported.value.success.length} movements</div>
        </h3>}
      </div>}
    </div>

  </div>;
});

const requiredColumns = ['date', 'amount', 'type', 'description'];
const optionalColumns = ['sender', 'receiver'];

export async function readCSV(files: FileList) {
  if (Number(files?.length) <= 0) {
    return {
      error: 'EmptyFile' as const
    };
  }

  let csvParsed: DSVRowArray | undefined;
  try {
    csvParsed = await files.item(0)?.text().then(text => csvParse(text))
  } catch (error) {
    // will return an error
  }
  if (csvParsed == undefined) {

    return {
      error: 'CantReadOrParseFile' as const
    }
  }

  const allRequiredColumnsAreThere = requiredColumns
    .every(requiredColumn => csvParsed?.columns?.includes(requiredColumn));

  if (!allRequiredColumnsAreThere) {
    return { error: 'MissingColumns' as const, expected: [...requiredColumns], received: csvParsed.columns }
  }

  const random = Math.random()*100000;
  return {
    success: csvParsed.map((m, i): DemoMovement => {
      const amount = parseFloat(m.amount ?? '')
      const date = new Date(Date.parse(m.date ?? ''));
      return {
        description: '',
        ...m,
        id: `${random}${i}`,
        amount: amount,
        type: m.type?.toLocaleLowerCase() === 'debit' ? 'Debit' : 'Credit',
        date: date,
        // month is zero based i.e. index
        month: `${date.getMonth() + 1}-${date.getFullYear()}`,
        categories: [],
      }
    })
  }

}
