import { QwikIntrinsicElements, component$, useId, useSignal, useStylesScoped$, useVisibleTask$ } from '@builder.io/qwik';

import styles from './reports-svg.scss?inline';
import { Axis, NumberValue } from 'd3';

export interface ReportSvgProps {
  width: number;
  height: number;
  movements: {
    id: string;
    amount: number;
    description: string;
    type: 'Credit' | 'Debit';
    coord: QwikIntrinsicElements['rect'];
  }[]
}

export const ReportsSvg = component$(({ height, width, movements: ms }: ReportSvgProps) => {
  useStylesScoped$(styles);

  const xScale = useSignal<any>();
  // useVisibleTask$(() => {
  //   amountAxis(xScale.value);
  // })

  return <>

  </>;
});

export type RectProps = Omit<QwikIntrinsicElements['rect'], 'key'> & Omit<QwikIntrinsicElements['text'], 'key'> & {
  key: string;
  movement: { amount: number; description: string; type: 'Credit' | 'Debit' };
};
export const Rect = component$(({ movement, key, hidden, class: cs, ...props }: RectProps) =><rect key={key} {...props}></rect>);
  {/* <text key={key} {...props} fill="black" textLength="40%" class="small-text">{`${movement.amount}лв ${movement.description}`}</text> */}
