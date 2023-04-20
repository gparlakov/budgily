import {
  Resource,
  component$,
  useResource$,
  useVisibleTask$,
} from '@builder.io/qwik';
import * as d3 from 'd3';
import { XMLParser } from 'fast-xml-parser';
import { readFile, readdir } from 'fs/promises';

const folder = 'budgily/public/';
const parser = new XMLParser();

interface DSKExport {
  AccountMovements: {
    AccountMovement: {
      ValueDate: string;
      Reason: string;
      OppositeSideName: string;
      OppositeSideAccount: string;
      MovementType: 'Debit' | 'Credit';
      Amount: string;
    }[];
  };
}

const files$: Promise<DSKExport[]> = readdir(folder, {
  encoding: 'utf8',
  withFileTypes: true,
})
  .then((entries) =>
    entries.filter((e) => e.isFile() && e.name.endsWith('.xml'))
  )
  .then((xmls) => xmls.map((x) => readFile(`${folder}${x.name}`)))
  .then((fileReadPromises) => Promise.all(fileReadPromises))
  .then((fileBuffers) => fileBuffers.map((b) => b.toString('utf-8')))
  .then((fileContents) => {
    const parsed: DSKExport[] = fileContents.map((c) => parser.parse(c));

    return parsed;
  });

export default component$(() => {
  const files = useResource$(async () => files$)

  useVisibleTask$(async () => {
    const fs = await files.value;

    // const monthly = d3.rollup(fs, f => f.map(x => x.AccountMovements.AccountMovement), f => f.AccountMovements.AccountMovement[0].ValueDate)

    // Update…
    const p = d3
      .select('div[d3-root]')
      .selectAll('p')
      .data([4, 8, 15, 16, 23, 42])
      .text(function (d) {
        return d;
      });

    // Enter…
    p.enter()
      .append('p')
      .text(function (d) {
        return d;
      });

    // Exit…
    () => p.exit().remove();
    // cleanup(() => p.exit());
  });

  return (
    <>
      <Resource
        value={files}
        onPending={() => <div>Loading...</div>}
        onResolved={(fs) => <div>files length {fs.length}</div>}
      />
    </>
  );
});
