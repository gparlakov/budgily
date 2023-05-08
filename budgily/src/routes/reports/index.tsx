import {
  $,
  component$,
  useContext,
  useOnWindow,
  useSignal,
  useStore,
  useStyles$,
  useVisibleTask$,
} from '@builder.io/qwik';

import { Category, MovementType, getDskReportsV2 } from '@codedoc1/budgily-data-client';
import * as d3 from 'd3';
import { max, scaleOrdinal } from 'd3';

import { ClientContext } from '../../core/client.context';
import { debounce } from '../../core/debounce';
import { MovementDetails } from '../../components/movement-details/movement-details';

import global from './index.scss?inline';

const debounceMovementsMillis = 300;

export default component$(() => {
  useStyles$(global);
  const clientContext = useContext(ClientContext);

  const svgRef = useSignal<Element>();
  const store = useStore<ReportsViewModel>(initialReportsVM());

  const debouncedSVGResize = $(() => {
    const { width } = document.querySelector('.sizer')?.getBoundingClientRect() ?? store;

    if (store.debounceRef) {
      clearTimeout(store.debounceRef);
    }
    store.debounceRef = setTimeout(() => {
      store.width = width;
      clearTimeout(store.debounceRef);
    }, store.debounceTime) as unknown as number;
  });
  useOnWindow('resize', debouncedSVGResize);

  useVisibleTask$(async ({ track, cleanup }) => {
    // console.log('starting -----');

    track(() => svgRef.value); // will redraw when the ref updates
    track(() => store.width); // for a different window - redraw
    // track(() => store.movements); // for movements change - redraw
    const controller = new AbortController();

    if (!store.initialized) {
      debouncedSVGResize();
      store.initialized = true;
      return; // skip loading as the store will set the width and trigger this fn
    }

    store.movements = await debouncedGetAllMovements(clientContext, controller)
      .then((response) => {
        if (response.errors) {
          // error handling
          console.log(response.errors);
        }
        return Array.isArray(response?.data?.movements)
          ? response.data?.movements.map((d) => ({
              ...d,
              amount: Number(d.amount),
              description: d.description ?? '',
              type: d.type === MovementType.Credit ? ('Credit' as const) : ('Debit' as const),
              date: new Date(Number(d.date)),
              id: d.id,
              categories: d.categories?.filter((c): c is Category => c != null).map((c) => ({ name: c.name })) ?? [],
            }))
          : [];
      })
      .catch((e) => {
        // tell users
        console.log(e);
        return [];
      });

    // can't draw if missing stuff
    // todo - error message or empty result?
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

    const monthlyCreditOrDebit = [...monthly.values()].flatMap((m) => [...m.values()]);
    const monthlyCreditOrDebitSums = monthlyCreditOrDebit.map(sumAmounts);
    const maxSum = max(monthlyCreditOrDebitSums) ?? 25000;
    const debitScale = d3
      .scaleLinear()
      // from 0 to the max of the monthly credit/debit sums
      .domain([0, maxSum])
      .range([0, width - padding - monthsWidth - padding]); // accounts for the bars starting at padding + monthsWidth
    const creditScale = debitScale;

    const color = scaleOrdinal<'Credit' | 'Debit', string>(['teal', 'orange']).domain(['Credit', 'Debit']);

    const y = d3
      .scaleBand([padding, height - padding])
      .domain(monthly.keys())
      .padding(0.2)
      .round(true);

    const barsStart = padding + monthsWidth;

    const main = d3.select(svgRef.value as Element);

    cleanup(() => {
      main?.selectChildren().remove();
      controller.abort();
    });

    const wrapper = main.append('g');

    // debit
    wrapper
      .selectAll()
      .data(monthly)
      .enter()
      .append('rect')
      .attr('width', ([, values]) => debitScale(sumAmounts(values.get('Debit'))))
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
      .attr('x', ([, values]) => Number(max([debitScale(sumAmounts(values.get('Debit'))), 30])) + barsStart)
      .classed('debit', true)
      .text(([, values]) => `-${sumAmounts(values.get('Debit')).toFixed(2)}лв`);

    // credit
    wrapper
      .selectAll()
      .data(monthly)
      .enter()
      .append('rect')
      .attr('width', ([, values]) => creditScale(sumAmounts(values.get('Credit'))))
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
      .attr('x', ([, values]) => Number(max([creditScale(sumAmounts(values.get('Credit'))), 30])) + barsStart)
      .classed('credit', true)
      .text(([, values]) => `+${sumAmounts(values.get('Credit')).toFixed(2)}лв`);

    // credit By type
    const creditByTypeColor = d3
      .scaleOrdinal(d3.schemeTableau10)
      .domain(monthlyCreditOrDebit.flatMap((ms) => ms.flatMap((m) => m.categories.map((c) => c.name))));

    const positionX = d3.scaleLinear([50, 200]).domain([0, 2000]);
    wrapper
      .selectAll()
      .data(monthly)
      .enter()
      // add a group for the credit by type
      .append('g')
      .attr('transform', ([key]) => `translate(0, ${Number(y(key)) + (y.bandwidth() / 3) * 2 + 1})`)

      // add rectangles for each credit type
      .selectAll('rect')
      .data(([, perMonth]) => {
        const credits = perMonth.get('Credit') ?? [];
        const stackFn = d3.stack().keys(credits.map((c) => c.id));
        const stacked = stackFn([credits.reduce((acc, c) => ({ ...acc, [c.id]: c.amount }), {})]);
        return stacked;
      })
      .join('rect')
      .attr('height', y.bandwidth() / 3)
      .attr('width', ([[start, end]]) => creditScale(end) - creditScale(start))
      .attr('x', ([[start]]) => creditScale(start) + barsStart)
      .attr('fill', (x) => {
        const cat = allMovements.find((m) => m.id === x.key)?.categories[0] ?? {name: x.key};
        return creditByTypeColor(cat.name)
      })
      .on('mouseenter', ({ clientX, clientY }, x) => {
        store.showOver = true;
        // give it 10px to avoid flickering
        store.positionX = `${positionX(clientX)}px`;
        store.positionY = `${clientY + 10}px`;
        const m = allMovements.find((m) => m.id === x.key);
        store.text = `+${m?.amount}лв. ${m?.description}`;
      })
      .on('mouseleave', () => {
        store.showOver = false;
      })
      .on('click', (event, x) => {
        store.selectedMovementId = x.key;
      });

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
      {/* <Resource
        value={dskMovements}
        onResolved={(f) => {
          store.movements = f;
          return (
            <div>
              <p>Total Credit {sumAmounts(f?.filter((m) => m.type === 'Credit')).toFixed(2)}</p>
              <p>Total Debit {sumAmounts(f?.filter((m) => m.type === 'Debit')).toFixed(2)}</p>
            </div>
          );
        }}
        onPending={() => <div>Loading ....</div>}
      /> */}
      <svg width={store.width} height={store.height} ref={svgRef} />
      <div class="sizer"></div>
      <div
        class="hover"
        style={{ display: store.showOver ? 'block' : 'none', top: store.positionY, left: store.positionX }}
      >
        {store.text}
      </div>
      {store.selectedMovementId != null ? (
        <MovementDetails
          movementId={store.selectedMovementId}
          onClose$={() => {
            store.selectedMovementId = undefined;
            store.width += Math.random() > 0.5 ? Math.random()*0.001 : -Math.random()*0.001;
          }}
        />
      ) : (
        <></>
      )}
    </>
  );
});

function initialReportsVM(): ReportsViewModel {
  return {
    width: 800,
    height: 1200,
    padding: 10,
    monthsWidth: 80,
    debounceTime: 300,
    initialized: false,
  };
}

export function sumAmounts(ms?: { amount: number }[]): number {
  return Array.isArray(ms) ? ms.map((a) => a.amount).reduce((a, b) => a + b, 0) : 0;
}

export const debouncedGetAllMovements = debounce(getDskReportsV2, debounceMovementsMillis);

type MovementVm = {
  categories: Array<{ name: string }>;
  amount: number;
  description: string;
  date: Date;
  type: 'Credit' | 'Debit';
  id: string;
};

interface ReportsViewModel {
  movements?: MovementVm[];
  width: number;
  height: number;
  padding: number;
  monthsWidth: number;
  debounceTime: number;
  debounceRef?: number;
  showOver?: boolean;
  positionX?: string;
  positionY?: string;
  text?: string;
  initialized: boolean;

  selectedMovementId?: string;
}
