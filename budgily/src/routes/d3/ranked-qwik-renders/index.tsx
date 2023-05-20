import {
  component$,
  useStore,
  useVisibleTask$ as useClientEffect$,
  useSignal,
  useOnWindow,
  useTask$,
  $,
  useStylesScoped$
} from '@builder.io/qwik';
import * as d3 from 'd3';
import { ChartData, NormalizedChartRecord, dotme, getNormalizedData, setSvgDimension } from './utils';
import scoped from './index.scss?inline'
export interface ChartProps {
  data: ChartData;
}

export const data = {
  Apple: 100,
  Apricot: 200,
  Araza: 5,
  Avocado: 1,
  Banana: 150,
  Bilberry: 700,
  Blackberry: 40,
  Blackcurrant: 77,
  Blueberry: 15,
  Boysenberry: 22,
  Breadfruit: 90,
  Canistel: 103,
  Cashew: 5,
  Cempedak: 9,
  Cherry: 30,
  Cloudberry: 99,
  Coconut: 2,
  Cranberry: 1,
  Currant: 20,
  Damson: 80,
  Date: 90,
  Durian: 20,
  Elderberry: 35,
  Feijoa: 11,
  Fig: 0,
};


const y = d3
.scaleBand()
.domain(Object.keys(data))
.range([0, 500])
.padding(0.1)
.round(true);

export default component$(() => {
  useStylesScoped$(scoped);

  return <svg class="chart" height="500px" >


  </svg>;
});

export

const namesColumnWidth = 55;
export function render(
  normalizedData: NormalizedChartRecord[],
  svgRef: any,
  width: number,
  height: number
) {
  const wrapper = d3
    .select(svgRef.value)
    // .append('svg')
    // .attr('width', width)
    // .attr('height', height)

  const svg = wrapper
    .append('g')
    // .attr('transform', 'translate(0,0)');

  const color = d3
    .scaleOrdinal()
    .domain(normalizedData.map(f => f.fruit))
    .range(d3.schemeTableau10);

  const bars = svg
    .selectAll()
    .data(normalizedData)
    .enter()
      .append('g')

    bars
      .append('rect')
        .attr('x', namesColumnWidth)
        .attr('width', f => f.width)
        .attr('y', f => y(f.fruit) ?? 0)
        .attr('height', y.bandwidth())
        .attr('fill', f => color(f.fruit) as string)
        .on('mouseover', ({target}: {target: Element}) => target.parentElement?.querySelector('text')?.setAttribute('style', 'display:initial'))
      ;

    bars
      .append('text')
        .attr('x', f => namesColumnWidth + f.width + 2)
        .attr('y', (f) => Number(y(f.fruit)) + y.bandwidth())
        .attr('height', y.bandwidth() / 2)
        .attr('fill', (d) => color(d.fruit) as string)
        .text(d => `${d.value} ${d.fruit}`)
        .style('display', f => f.value > 5 ? 'none' : 'initial');

      svg.append('g')
        .attr('transform', `translate(${namesColumnWidth}, 0)`)
        .call(d3.axisLeft(y))


    // svg
    // .selectAll()
    // .data(normalizedData)
    // .enter()



  // svg
  //   .selectAll('text')
  //   .data(normalizedData)
  //   .join('text')
  //   .text((d) => d.fruit)
  //   .attr('x', (d) => d.x + 5)
  //   .attr('y', () => 30)
  //   .attr('width', (d) => d.width - 1)
  //   .attr('fill', 'white');

  // svg.selectAll('text').call(dotme);
}
