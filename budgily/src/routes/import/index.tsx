import { component$, useSignal } from '@builder.io/qwik';
import { Form } from '@builder.io/qwik-city';
import { DemoMovement } from '@codedoc1/budgily-data-client';
import { DSVRowArray, csvParse } from 'd3';

type UnpackPromise<T> = T extends Promise<infer U> ? U : never;

export default component$(() => {

  const imported = useSignal<UnpackPromise<ReturnType<typeof readCSV>>>()

  return <div>

    <Form>
      <div class="join join-vertical">
      <div class="form-control join-item">
        <h1>Import a movements file</h1>
        <label class="label"><span class="label-text">Import from a file (only .csv)</span></label>
        <input onChange$={async (_, input) => imported.value = input.files ? await readCSV(input.files) : undefined} name="file" accept=".csv" type="file"
          placeholder="Input from a csv file" class={`file-input w-full ${imported.value?.error ? 'file-input-warning' : ''} `} />
      </div>
        <span>{imported.value?.error}</span>
        {imported.value?.error === 'CantReadOrParseFile' && <div class="join-item">Cant read or parse file</div>}
      </div>

      <div>
        <h3>Expecting a csv file with the following headers</h3>

        <pre>{`date,amount,type,description,sender,receiver
2023-09-09T15:30:00Z,145.5,credit,a description,My employer,
2023-05-09T15:30:00Z,45.5,debit,rent,,landlord`}
        </pre>
      </div>
    </Form>
  </div>;
});


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

  const allRequiredColumnsAreThere = ['date', 'amount', 'type', 'description']
    .every(requiredColumn => csvParsed?.columns?.includes(requiredColumn));

  if (!allRequiredColumnsAreThere) {
    return { error: 'MissingColumns' as const}
  }

  return {
    success: csvParsed.map((m): DemoMovement => {
      const amount = parseFloat(m.amount ?? '')
      const date = new Date(Date.parse(m.date ?? ''));

      return {
        ...m,
        amount: amount,
        date: date
      } as DemoMovement
    })
  }

}
