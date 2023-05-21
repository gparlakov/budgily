import {
  $,
  QwikIntrinsicElements,
  Resource,
  component$,
  useResource$,
  useSignal,
  useStore,
  useStylesScoped$,
  useVisibleTask$,
} from '@builder.io/qwik';

import { Series, group, scaleBand, scaleLinear, stack } from 'd3';
import { Sizer } from '../sizer/sizer';
import styles from './reports-landing.scss?inline';

export interface ReportsLandingProps {
  movements: MovementVm[];
  maxSum: number;
  months: string[];
}

export const ReportsLanding = component$(({ movements, maxSum, months }: ReportsLandingProps) => {
  useStylesScoped$(styles);

  const store = useStore<ReportsViewModel>(initialReportsVM(), { deep: false });

  const resize = $((size: number) => {
    store.width = size;
  });

  const movementsRes = useResource$(({ track }) => {
    track(() => store.width);
    return useAxis({ ...store, movements, maxSum, months, monthsWidth: 50 });
  });

  console.log('---render reports landing ');
  return (
    <>
      <Sizer onSize={resize} debounceTime={300}></Sizer>
      <Resource
        value={movementsRes}
        onResolved={(ms) => (
          <svg width={store.width} height={store.height}>
            <g id="scale-x">
              <text x={store.width / 2 - 40} y="15" fill="black">
                Loaded movement: {ms.length}
              </text>
              {ms.map((m) => (
                <Rect key={m.id} {...m.coord}></Rect>
              ))}
            </g>
          </svg>
        )}
        onPending={() => (
          <>
            Pending: <PendingCounter />
          </>
        )}
      ></Resource>
    </>
  );
});

export type RectProps = QwikIntrinsicElements['rect'] & { key: string };
export const Rect = component$(({ key, ...props }: RectProps) => <rect key={key} {...props}

></rect>);

export const PendingCounter = component$(() => {
  const seconds = useSignal(0);

  console.log('rerender pending');

  useVisibleTask$(() => {
    const timer = setInterval(() => (seconds.value += 1), 1000);

    return () => clearTimeout(timer);
  });

  return <span>Pending {seconds}</span>;
});

function useAxis({
  height,
  padding,
  months,
  movements,
  width,
  monthsWidth,
  maxSum,
}: ReportsViewModel & {
  months: string[];
  maxSum: number;
  movements: MovementVm[];
  monthsWidth: number;
}): MovementWithCoordinates[] {
  const monthsSorted = [...months].sort((a, b) => b.localeCompare(a));

  const y = scaleBand([padding, height - padding])
    .domain(monthsSorted)
    .padding(0.2)
    .round(true);

  const amountAxisX = scaleLinear([padding + monthsWidth, width - monthsWidth - 2 * padding]).domain([0, maxSum]);

  const monthly = group(
    movements,
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

  return movements.map((m) => {
    const [[start, end]] = stacks[m.month][m.type].find((x) => x.key === m.id) ?? [[0, 0]];

    const c = m as MovementWithCoordinates;
    c.coord = {
      y: (y(m.month) ?? 0) + (m.type === 'Debit' ? y.bandwidth() / 2 : 0),
      x: amountAxisX(start),

      width: `${amountAxisX(end) - amountAxisX(start)}`,

      height: `${y.bandwidth() / 2}`,
      fill: m.type === 'Credit' ? 'red' : 'green',
      stroke: 'blue',
    };
    return c;
  });
}

export type MovementVm = {
  categories: Array<{ name: string }>;
  amount: number;
  description: string;
  date: Date;
  type: 'Credit' | 'Debit';
  id: string;
  month: string;
};

export type MovementWithCoordinates = MovementVm & {
  coord: {
    x: number;
    y: number;
    width: string;
    height: string;
    fill: string;
    stroke: string;
  };
};

interface ReportsViewModel {
  movementsCoords: Array<MovementWithCoordinates>;

  width: number;
  height: number;
  padding: number;

  selectedMovementId?: string;
}

function initialReportsVM(): ReportsViewModel {
  return {
    width: 800,
    height: 600,
    padding: 10,
    movementsCoords: [],
  };
}
