import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import * as d3 from 'd3';

export default component$(() => {
  const fruits = [
    { name: '🍊', count: 21 },
    { name: '🍇', count: 13 },
    { name: '🍏', count: 8 },
    { name: '🍌', count: 5 },
    { name: '🍐', count: 3 },
    { name: '🍋', count: 2 },
    { name: '🍎', count: 1 },
    { name: '🍉', count: 1 },
  ];

  const width = 1200;
  const height = 800;
  const margin = { top: 20, right: 0, bottom: 0, left: 30 };
  const svgRef = useSignal<Element>();
  const xAxis = useSignal<Element>();

  useVisibleTask$(() => {
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(fruits, (d) => d.count) ?? 100])
      .range([margin.left, width - margin.right])
      .interpolate(d3.interpolateRound);

    const y = d3
      .scaleBand()
      .domain(fruits.map((d) => d.name))
      .range([margin.top, height - margin.bottom])
      .padding(0.1)
      .round(true);

    d3.select(svgRef.value!).select(`#x-axis`)
      .append('<g></g>')
      .call(d3.axisTop(x) as any)
      .call((g) => g.select('.domain').remove());
  });
  return (
    <>
      <svg
        viewBox={`0 0 ${width} ${height} `}
        style={`max-width: ${width}px; font: 10px sans-serif;`}
        ref={svgRef}
      >
        <g fill="steelblue" >
          {/* {fruits.map((d) => (
            <rect
              y={y(d.name)}
              x={x(0)}
              width={x(d.count) - x(0)}
              height={y.bandwidth()}
            ></rect>
          ))} */}
        </g>
        {/* <g
          fill="white"
          text-anchor="end"
          transform={`translate(-6,${y.bandwidth() / 2})`}
          style="font-size: 2rem"
        >
          {fruits.map((d) => (
            <text y={y(d.name)} x={x(d.count)} dy="0.35em">
              {d.count}
            </text>
          ))}
        </g> */}
        {/* <g transform={`translate(0,${margin.top})`} id="x-axis">
          /
        </g> */}
      </svg>
    </>
  );
});

export const G = component$(() => {
  return <g></g>;
});

