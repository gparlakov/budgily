import {
  $,
  Resource,
  Signal,
  component$,
  useId,
  useResource$,
  useSignal,
  useStore,
  useStylesScoped$,
  useVisibleTask$,
} from '@builder.io/qwik';

import { Axis, NumberValue, Series, axisBottom, axisLeft, axisTop, group, scaleBand, scaleLinear, select, stack } from 'd3';
import { Sizer } from '../sizer/sizer';
import styles from './reports-landing.scss?inline';
import { Rect, ReportsSvg } from '../reports-svg/reports-svg';
import { MovementVm, MovementWithCoordinates } from '../../core/movement.types';


export interface ReportsViewModel {
  movementsCoords: Array<MovementWithCoordinates>;

  width: number;
  height: number;
  padding: number;

  selectedMovementId?: string;
}

export interface ReportsLandingProps {
  movements: MovementVm[];
  maxSum: number;
  months: string[];
}

export const ReportsLanding = component$(({ movements, maxSum, months }: ReportsLandingProps) => {
  useStylesScoped$(styles);

  const store = useStore<ReportsViewModel>(initialReportsVM(), { deep: false });
  const xAxis = useSignal<SVGGElement>();
  const yAxis = useSignal<SVGGElement>();

  useVisibleTask$(({ track }) => {
    track(() => store.width);
    if(xAxis.value == null) {
      return; // not ready to draw yet
    }
    calculateCoordinatesAndRenderAxis({ store, movements, maxSum, months, monthsWidth: 50, xAxis, yAxis });
  });

  return (
    <>
      <Sizer onSize={$((size: number) => { store.width = size; })} debounceTime={300}></Sizer>

      <svg width={store.width} height={store.height}>
        {store.movementsCoords && <g id="title"><text x={store.width - 150} y="45" fill="black">
          Count: {store.movementsCoords.length}
        </text></g>}
        <g ref={xAxis} transform="translate(0, 20)"></g>
        <g ref={yAxis} transform="translate(50, 0)"></g>
        <g id="movements">
          {store.movementsCoords?.map((m) => (
            <Rect key={m.id ?? useId()} {...m.coord} movement={m}></Rect>
          ))}
        </g>
      </svg>
    </>
  );
});

export const PendingCounter = component$(() => {
  const seconds = useSignal(0);

  useVisibleTask$(() => {
    const timer = setInterval(() => (seconds.value += 1), 1000);

    return () => clearTimeout(timer);
  });

  return <span>Pending {seconds}</span>;
});

function calculateCoordinatesAndRenderAxis({
  store,
  months,
  movements,
  monthsWidth,
  maxSum,
  xAxis,
  yAxis
}: {
  months: string[];
  maxSum: number;
  movements: MovementVm[];
  monthsWidth: number;
  xAxis: Signal<SVGGElement | undefined>;
  yAxis: Signal<SVGGElement | undefined>;
  store: ReportsViewModel;
}) {
  const { width, height, padding } = store;

  const y = scaleBand([padding, height - padding])
    .domain(months)
    .padding(0.2)
    .round(true);

  const amountScaleX = scaleLinear([padding + monthsWidth, width - monthsWidth - 2 * padding]).domain([0, maxSum]);

  const monthly = group(
    movements.sort((a, b) => b.amount - a.amount),
    (m) => m.month,
    (m) => m.type
  );

  const stacks = [...monthly.entries()].reduce((acc, [month, vs]) => {
    const credits = vs?.get('Credit') ?? [];
    const creditStack = stack().keys(credits.map((c) => c.id))([
      credits.reduce((acc, c) => ({ ...acc, [c.id]: c.amount }), {}),
    ]);
    // console.log(creditStack)

    const debits = vs?.get('Debit') ?? [];
    const debitStack = stack().keys(debits.map((c) => c.id))([
      debits.reduce((acc, c) => ({ ...acc, [c.id]: c.amount }), {}),
    ]);

    acc[month] = {
      Credit: creditStack,
      Debit: debitStack,
    };

    return acc;
  }, {} as Record<string, Record<MovementVm['type'], Series<Record<string, number>, string>[]>>);

  // give coordinates for the movements x,y,width,height,fill
  store.movementsCoords = movements.map((m) => {
    const [[start, end]] = stacks[m.month][m.type].find((x) => x.key === m.id) ?? [[0, 0]];

    const c = m as MovementWithCoordinates;
    c.coord = {
      y: (y(m.month) ?? 0) + (m.type === 'Debit' ? y.bandwidth() / 2 : 0),
      x: amountScaleX(start),

      width: `${amountScaleX(end) - amountScaleX(start)}`,

      height: `${y.bandwidth() / 2}`,
      fill: m.type === 'Credit' ? 'red' : 'green',
      stroke: 'blue',
    };
    return c;
  });

  // render amount axis how long is the
  if (xAxis.value) {
    const amountAxis = axisTop(amountScaleX).tickSizeInner(-store.height);
    amountAxis(select(xAxis.value));
  }

  // render months axis (12-2022 == Dec'22 | 1-2021 === Jan'21)
  if (yAxis.value) {
    axisLeft(y)(select(yAxis.value))
  }
}


function initialReportsVM(): ReportsViewModel {
  return {
    width: 800,
    height: 600,
    padding: 10,
    movementsCoords: [],
  };
}
