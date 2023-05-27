import { QwikIntrinsicElements, component$, useStylesScoped$ } from '@builder.io/qwik';

import styles from './reports-svg.scss?inline';

export interface ReportSvgProps {
  width: number;
  height: number;
  movements: {
    id: string
    coord: QwikIntrinsicElements['rect']
  }[]
}

export const ReportsSvg = component$(({ height, width, movements: ms }: ReportSvgProps) => {
  useStylesScoped$(styles);

  return <>
    <svg width={width} height={height}>
      <g id="scale-x">
        <text x={width / 2 - 40} y="15" fill="black">
          Loaded movement: {ms?.length}
        </text>
        {ms?.map((m) => (
          <Rect key={m.id} {...m.coord}></Rect>
        ))}
      </g>
    </svg>
  </>;
});

export type RectProps = QwikIntrinsicElements['rect'] & { key: string };
export const Rect = component$(({ key, ...props }: RectProps) => <rect key={key} {...props}

></rect>);
