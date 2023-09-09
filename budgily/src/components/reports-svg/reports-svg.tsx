import { QwikIntrinsicElements, component$ } from '@builder.io/qwik';

export type RectProps = Omit<QwikIntrinsicElements['rect'], 'key'> & Omit<QwikIntrinsicElements['text'], 'key'> & {
  key: string;
  movement: { amount: number; description: string; type: 'Credit' | 'Debit' };
};
export const Rect = component$(({ key, ...props }: RectProps) =><rect key={key} {...props}></rect>);
