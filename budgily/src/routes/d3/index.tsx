import {
  $,
  Resource,
  component$,
  useOnWindow,
  useResource$,
  useSignal,
  useStore,
  useStyles$,
  useVisibleTask$,
} from '@builder.io/qwik';

import * as d3 from 'd3';
import { max, scaleOrdinal } from 'd3';
import { getDSKReportFiles, getDskReports } from '../../core/dsk-reports';
import { Movement, MovementType } from '../../core/types';

import global from './index.scss?inline';

export default component$(() => {
  useStyles$(global);
  const fetch = useSignal<'fetch' | undefined>();
  const dskMovements = useResource$<Movement[]>(({ track }) => {
    track(() => fetch.value);
    if (fetch.value) {
      return getDskReports(getDSKReportFiles(window.location)).then(
        (movements) =>
          movements.sort((a, b) => b.date.valueOf() - a.date.valueOf())
      );
    }
    return [];
  });
  const svgRef = useSignal<Element>();
  const store = useStore<{
    movements?: Movement[];
    width: number;
    height: number;
    padding: number;
    monthsWidth: number;
    debounceTime: number;
    debounceRef?: number;
  }>({
    width: 800,
    height: 700,
    padding: 10,
    monthsWidth: 80,
    debounceTime: 300,
  });

  const debouncedSVGResize = $(() => {
    const { width } = document.querySelector('.sizer')?.getBoundingClientRect() ?? store;

    if (store.debounceRef) {
      clearTimeout(store.debounceRef);
    }
    store.debounceRef = setTimeout(
      () => {
        store.width = width;
        clearTimeout(store.debounceRef);
      },
      store.debounceTime
    ) as unknown as number;
  });
  useOnWindow(
    'resize',
    debouncedSVGResize
  );

  useVisibleTask$(({ track, cleanup }) => {
    // console.log('starting -----');
    if (fetch.value !== 'fetch') {
      fetch.value = 'fetch'; // initiate the fetching
      debouncedSVGResize();
    }
    track(() => svgRef.value); // will redraw when the ref updates
    track(() => store.width); // for a different window - redraw
    track(() => store.movements); // for movements change - redraw

    if (!svgRef.value || !Array.isArray(store.movements)) {
      return;
    }

    const { width, height, padding, monthsWidth } = store;
    const allMovements = store.movements;

    const monthly = d3.group(
      allMovements,
      (m) => {
        return `${m.date.getMonth() + 1}-${m.date.getFullYear()}`;
      },
      (m) => m.type
    );

    const monthlyCreditOrDebitSums = [...monthly.values()]
      .flatMap((m => ([...m.values()])))
      .map(sumAmounts);
    const maxSum = max(monthlyCreditOrDebitSums) ?? 25000;
    const debitScale = d3
      .scaleLinear()
      // from 0 to the max of the monthly credit/debit sums
      .domain([0, maxSum])
      .range([0, width - padding - monthsWidth - padding]); // accounts for the bars starting at padding + monthsWidth
    const creditScale = debitScale;

    const colorDomain: MovementType[] = ['Credit', 'Debit'];
    const color = scaleOrdinal<MovementType, string>(['teal', 'orange']).domain(
      colorDomain
    );

    const y = d3
      .scaleBand([padding, height - padding])
      .domain(monthly.keys())
      .padding(0.2)
      .round(true);

    const barsStart = padding + monthsWidth;

    const main = d3.select(svgRef.value as Element);

    cleanup(() => {
      // console.log('clearing', main.selectChildren());
      main.selectChildren().remove();
    });

    const wrapper = main.append('g');

    // debit
    wrapper
      .selectAll()
      .data(monthly)
      .enter()
      .append('rect')
      .attr('width', ([, values]) =>
        debitScale(sumAmounts(values.get('Debit')))
      )
      .attr('height', y.bandwidth() / 3)
      .attr('y', ([key]) => Number(y(key)))
      .attr('x', barsStart)
      .attr('fill', color('Debit'));

    wrapper
      .selectAll()
      .data(monthly)
      .enter()
      .append('text')
      .attr('alignment-baseline', 'hanging')
      .attr('text-anchor', 'end')
      .attr('y', ([key]) => Number(y(key)))
      .attr(
        'x',
        ([, values]) =>
          debitScale(sumAmounts(values.get('Debit'))) + barsStart
      )
      .classed('debit', true)
      .text(([, values]) => `-${sumAmounts(values.get('Debit')).toFixed(2)}лв`);

    // credit
   wrapper
      .selectAll()
      .data(monthly)
      .enter()
      .append('rect')
      .attr('width', ([, values]) =>
        creditScale(sumAmounts(values.get('Credit')))
      )
      .attr('height', y.bandwidth() / 3)
      .attr('y', ([key]) => Number(y(key)) + y.bandwidth() / 3)
      .attr('x', barsStart)
      .attr('fill', color('Credit'));

    wrapper
      .selectAll()
      .data(monthly)
      .enter()
      .append('text')
      .attr('alignment-baseline', 'hanging')
      .attr('text-anchor', 'end')
      .attr('y', ([key]) => Number(y(key)) + y.bandwidth() / 3)
      .attr(
        'x',
        ([, values]) =>
          Number(max([creditScale(sumAmounts(values.get('Credit'))), 30])) + barsStart
      )
      .classed('credit', true)
      .text(([, values]) => `+${sumAmounts(values.get('Credit')).toFixed(2)}лв`);

    // credit By type
    wrapper
      .selectAll()
      .data(monthly)
      .enter()
      // add a group for the credit by type
      .append('g')
        .attr('transform', ([key, ]) => `translate(0, ${Number(y(key)) + ((y.bandwidth() / 3) * 2) + 1})`)

      // add rectangles for each credit type
      .selectAll('rect')
      .data(([,perMonth]) => {
        const credits = perMonth.get('Credit') ?? [];
        const stack = d3.stack().keys(credits.map(c => c.description))
        const stacked = stack([credits.reduce((acc,c) => ({...acc, [c.description]: c.amount}), {})]);
        return stacked;
      })
        .join('rect')
        .attr('height', y.bandwidth() / 3)
        .attr('width', ([[start, end]]) => creditScale(end) - creditScale(start))
        .attr('x', ([[start]]) => creditScale(start) + barsStart)
        .attr('fill', 'Green')
        // .on('hover', );

    // const creaditFromStacker = d3
    //   .stack()
    //   .keys(credits.map((m) => m.oppositeSideName));
    // creaditFromStacker(credits.map(v => ({[v.oppositeSideName]: v.})))

    // months axis
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
                {sumAmounts(f?.filter((m) => m.type === 'Credit')).toFixed(2)}
              </p>
              <p>
                Total Debit{' '}
                {sumAmounts(f?.filter((m) => m.type === 'Debit')).toFixed(2)}
              </p>
            </div>
          );
        }}
        onPending={() => <div>Loading ....</div>}
      />
      <svg width={store.width} height={store.height} ref={svgRef} />
      <div class="sizer"></div>
    </>
  );
});

export function sumAmounts(ms?: Movement[]): number {
  return Array.isArray(ms)
    ? ms.map((a) => a.amount).reduce((a, b) => a + b, 0)
    : 0;
}
