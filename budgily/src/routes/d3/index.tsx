import {
  Resource,
  component$,
  useResource$,
  useSignal,
  useStore,
  useVisibleTask$
} from '@builder.io/qwik';
import { getDSKReportFiles, getDskReports } from '../../core/dsk-reports';
import { Movement, MovementType } from '../../core/types';

import * as d3 from 'd3';
import { scaleOrdinal } from 'd3';

const width = 600;
const height = 700;
const padding = 10;
const monthsWidth = 80;
export default component$(() => {
  const fetch = useSignal<'fetch' | undefined>();
  const dskMovements = useResource$<Movement[]>(({ track }) => {
    track(() => fetch.value);
    if (fetch.value) {
      return getDskReports(getDSKReportFiles(window.location));
    }
    return [];
  });
  const svgRef = useSignal<Element>();
  const store = useStore<{ movements?: Movement[] }>({});

  useVisibleTask$(({ track }) => {
    fetch.value = 'fetch'; // initiate the fetching
    track(() => svgRef.value); // will redraw when the ref updates
    track(() => store.movements); // for movements change - redraw

    if (!svgRef.value || !Array.isArray(store.movements)) {
      return;
    }

    const allMovements = store.movements;

    const monthly = d3.group(
      allMovements,
      (m) => {
        return `${m.date.getMonth() + 1}-${m.date.getFullYear()}`;
      },
      (m) => m.type
    );

    const xDebit = d3
      .scaleLinear()
      .domain([0, 15000])
      .range([padding + monthsWidth, width - padding]);

    const xCredit = d3
      .scaleLinear()
      .domain([0, 15000])
      .range([padding + monthsWidth, width - padding]);

    const colorDomain: MovementType[] = [
      'Credit',
      'Debit',
    ];
    const color = scaleOrdinal<MovementType, string>([
      'teal',
      'orange',
    ]).domain(colorDomain);

    const y = d3
      .scaleBand([padding, height - padding])
      .domain(monthly.keys())
      .padding(0.1)
      .round(true);

    const barsStart = padding + monthsWidth;

    // debit
    d3.select(svgRef.value as Element)
      .append('g')
      .selectAll()
      .data(monthly)
      .enter()
      .append('rect')
      .attr('width', ([, values]) => xDebit(sumAmmounts(values.get('Debit'))))
      .attr('height', y.bandwidth() / 3)
      .attr('y', ([key]) => Number(y(key)))
      .attr('x', barsStart)
      .attr('fill', color('Debit'))
      .classed('debit', true)
      .text(([, values]) => sumAmmounts(values.get('Debit')).toFixed(2));

    d3.select(svgRef.value as Element)
      .append('g')
      .selectAll()
      .data(monthly)
      .enter()
      .append('text')
      .attr('alignment-baseline', 'hanging')
      .attr('text-anchor', 'end')
      .attr('y', ([key]) => Number(y(key)))
      .attr('x', ([, values]) => xDebit(sumAmmounts(values.get('Debit'))))
      .classed('debit', true)
      .text(([, values]) => sumAmmounts(values.get('Debit')).toFixed(2));

    // credit
    d3.select(svgRef.value as Element)
      .append('g')
      .selectAll()
      .data(monthly)
      .enter()
      .append('rect')
      .attr('width', ([, values]) => xCredit(sumAmmounts(values.get('Credit'))))
      .attr('height', y.bandwidth() / 3)
      .attr('y', ([key]) => Number(y(key)) + y.bandwidth() / 3)
      .attr('x', barsStart)
      .attr('fill', color('Credit'))
      .classed('Credit', true)
      .text(([, values]) => sumAmmounts(values.get('Credit')).toFixed(2));

    d3.select(svgRef.value as Element)
      .append('g')
      .selectAll()
      .data(monthly)
      .enter()
      .append('text')
      .attr('alignment-baseline', 'hanging')
      .attr('text-anchor', 'end')
      .attr('y', ([key]) => Number(y(key)) + y.bandwidth() / 3)
      .attr('x', ([, values]) => xCredit(sumAmmounts(values.get('Credit'))))
      .classed('Credit', true)
      .text(([, values]) => sumAmmounts(values.get('Credit')).toFixed(2));

    // credit By type
    const credits = allMovements.filter(m => m.type === 'Credit')
    const creaditFromStacker = d3.stack().keys(credits.map(m => m.oppositeSideName));
    // creaditFromStacker(credits.map(v => ({[v.oppositeSideName]: v.})))

    // credit
    d3.select(svgRef.value as Element)
      .append('g')
      .selectAll()
      .data(monthly)
      .enter()
      .append('g')

      .attr('width', ([, values]) => xCredit(sumAmmounts(values.get('Credit'))))
      .attr('height', y.bandwidth() / 3)
      .attr('y', ([key]) => Number(y(key)) + y.bandwidth() / 3)
      .attr('x', barsStart)
      .attr('fill', color('Credit'))
      .classed('Credit', true)
      .text(([, values]) => sumAmmounts(values.get('Credit')).toFixed(2));

    d3.select(svgRef.value as Element)
      .append('g')
      .call(d3.axisLeft(y))
      .attr('transform', `translate(${monthsWidth}, 0)`);
  });

  return (
    <>
      <Resource
        value={dskMovements}
        onResolved={(f) => {
          store.movements = f;
          return (
            <div>
              <p>
                Total Credit{' '}
                {sumAmmounts(
                  f?.filter(
                    (m) => m.type === 'Credit'
                  )
                ).toFixed(2)}
              </p>
              <p>
                Total Debit{' '}
                {sumAmmounts(
                  f?.filter(
                    (m) => m.type === 'Debit'
                  )
                ).toFixed(2)}
              </p>
            </div>
          );
        }}
        onPending={() => <div>Loading ....</div>}
      />
      <svg width={width} height={height} ref={svgRef} />
    </>
  );
});


export function sumAmmounts(ms?: Movement[]): number {
  return Array.isArray(ms)
    ? ms.map(a => a.amount).reduce((a, b) => a + b, 0)
    : 0;
}
