import {
  Resource,
  component$,
  useResource$,
  useSignal,
  useStore,
  useVisibleTask$,
} from '@builder.io/qwik';

import * as d3 from 'd3';
import { XMLParser } from 'fast-xml-parser';

type DSKAccountMovement = {
  ValueDate: string;
  Reason: string;
  OppositeSideName: string;
  OppositeSideAccount: string;
  MovementType: 'Debit' | 'Credit';
  Amount: string;
};

interface DSKExport {
  AccountMovements: {
    AccountMovement: DSKAccountMovement[];
  };
}

const width = 600;
const height = 800;
const padding = 10;
export default component$(() => {
  const url = useSignal<string>();
  const files = useResource$<DSKExport | undefined>(({ track }) => {
    track(() => url.value);
    if (url.value) {
      return getXmls(url.value);
    }

    // return new Promise(() => { return; });
    // return 'empty data';
  });
  // const files = useResource$(({ track }) => {
  //   track(() => url);

  //   if (!url.value) return {} as DSKExport; // ever pending

  //   return getXmls(url.value);
  // });
  const svgRef = useSignal<Element>();
  const store = useStore<{ file?: DSKExport }>({});

  useVisibleTask$(({ track }) => {
    track(() => svgRef.value); // will redraw when the ref updates
    track(() => store.file); // for files change - redraw

    const u = new URL(window.location.toString());
    u.pathname = 'report-2022.xml';
    url.value = u.toString();

    if (!svgRef.value || !store.file?.AccountMovements?.AccountMovement) return;

    // console.log(
    //   '---- drawing',
    //   store.file?.AccountMovements?.AccountMovement?.length,
    //   svgRef.value?.getAttribute('width')
    // );

    const allMovements = store.file.AccountMovements.AccountMovement;

    const monthly = d3.group(
      allMovements,
      (m) => {
        const [day, month, year] = m.ValueDate.split('.');
        const date = new Date(Number(year), Number(month) - 1, Number(day));

        if (date.toString() === new Date('Invalid date').toString()) {
          console.log('could not parse', m.ValueDate);
        }
        return `${date.getMonth() + 1}-${date.getFullYear()}`;
      },
      (m) => m.MovementType
    );

    // console.log(monthly.keys())
    const sumValues: (ms: DSKAccountMovement[]) => number = (ms) =>
      ms
        .map((m) => {
          const x = parseFloat(m.Amount.replace(',', '.'));
          // console.log('---parsing', m.Amount, x);
          return x;
        })
        .reduce((a, b) => a + b);

    // [...monthly.entries()].forEach(([key, values]) =>
    //   console.log(
    //     key,
    //     sumValues(values),
    //     values.map((v) => v.Amount)
    //   )
    // );

    const xDebit = d3
      .scaleLinear()
      .domain(
        [...monthly.values()]
          .map((vs) => vs.get('Debit') ?? [])
          .map(sumValues)
      )
      .range([padding, width - padding]);

    console.log(xDebit.domain());

    const xCredit = d3
      .scaleLinear()
      .domain(
        [...monthly.values()]
          .map((vs) => vs.get('Credit') ?? [])
          .map(sumValues)
      )
      .range([padding, width - padding]);


      console.log(xCredit.domain());

    const y = d3
      .scaleBand([padding, height - padding])
      .domain(monthly.keys())
      .padding(0.1)
      .round(true);

    console.log(y.domain())

    d3.select(svgRef.value as Element)
      .append('g')
      .selectAll()
      .data(monthly)
      .enter()
      .append('rect')
      .attr('width', ([, values]) => (xDebit(Number(sumValues(values))), 10))
      .attr('height', y.bandwidth())
      .attr('y', ([key]) => Number(y(key)))
      .attr('x', padding);
  });

  return (
    <>
      <Resource
        value={files}
        onResolved={(f) => {
          store.file = f;
          return <div>{f?.AccountMovements?.AccountMovement?.length}</div>;
        }}
        onPending={() => <div>Loading ....</div>}
      />
      <svg width={width} height={height} ref={svgRef} />
    </>
  );
});

export async function getXmls(url: string): Promise<DSKExport> {
  console.log('FETCH, ', url);
  return fetch(url)
    .then((response) => response.text())
    .then((str) => {
      const parser = new XMLParser();
      return parser.parse(str);
    })

    .catch(
      (e) => (
        console.log('----error', e),
        {
          AccountMovements: {
            AccountMovement: [],
          },
        } as DSKExport
      )
    );
}
