import * as d3 from 'd3';
import { Signal } from '@builder.io/qwik';

export function dotme(texts: d3.Selection<SVGElement, {}, HTMLElement, any>) {
  texts.each(function () {
    // @ts-ignore
    const text = d3.select(this);
    const chars = text.text().split('');

    let ellipsis = text.text(' ').append('tspan').text('...');
    // @ts-ignore
    const minLimitedTextWidth = ellipsis.node().getComputedTextLength();
    ellipsis = text.text('').append('tspan').text('...');

    const width =
      // @ts-ignore
      parseFloat(text.attr('width')) - ellipsis.node().getComputedTextLength();
    const numChars = chars.length;
    const tspan = text.insert('tspan', ':first-child').text(chars.join(''));

    if (width <= minLimitedTextWidth) {
      tspan.text('');
      ellipsis.remove();
      return;
    }

    // @ts-ignore
    while (tspan.node().getComputedTextLength() > width && chars.length) {
      chars.pop();
      tspan.text(chars.join(''));
    }

    if (chars.length === numChars) {
      ellipsis.remove();
    }
  });
}

export interface ChartData {
  [key: string]: number;
}

export interface NormalizedChartRecord {
  fruit: string;
  value: number;
  x: number;
  width: number;
}

export function getNormalizedData(
  data: any,
  width: number
): NormalizedChartRecord[] {
  if(!data) return [];
  const tmpData: any[] = [];
  let total = 0;
  for (const key of Object.keys(data)) {
    if (data[key] > 0) {
      tmpData.push({ fruit: key, value: data[key] });
      total += data[key];
    }
  }
  tmpData.sort((a, b) => b.value - a.value);
  let x = 0;
  for (const record of tmpData) {
    const percent = (record.value / total) * 100;
    const barwidth = (width * percent) / 100;
    record.x = x;
    record.width = barwidth;
    x += barwidth;
  }
  return tmpData;
}

export function setSvgDimension(
  svgRef: Signal<Element | undefined>,
  store: any
) {

  if (svgRef?.value) {
    const { width, height } = svgRef.value.getBoundingClientRect();
    console.log(width)
    store.width = width;
    store.height = height;
  }
}
