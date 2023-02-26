import { axisTop, create, range, scaleBand, scaleLinear } from "d3";
import { useEffect, useMemo, useState } from "react";
import getKeyframes from "./getKeyframes";
import { RacingBarChartParams, RacingChartKeyframe } from "./types";

type Params = {
  params: RacingBarChartParams;
};

export default function RacingBarChart({ params }: Params) {
  const { n, size, interpolations } = params;

  const chartMargin = useMemo(() => {
    return {
      top: size.margin * 3,
      right: size.avatar + size.margin * 2,
      bottom: size.margin,
      left: size.margin * 8,
    };
  }, [size]);

  const chartHeight = useMemo(() => {
    return chartMargin.top + size.bar * n + chartMargin.bottom;
  }, [size, chartMargin]);

  const [keyframes, setKeyframes] = useState<RacingChartKeyframe[]>([]);
  const [prev, setPrev] = useState<Map<any, any>>(new Map());
  const [next, setNext] = useState<Map<any, any>>(new Map());

  const [xScale, setXScale] = useState<any>(null);
  const [yScale, setYScale] = useState<any>(null);

  useEffect(() => {
    getKeyframes({ n, interpolations })
      .then((data) => {
        const _keyframes = data.keyframes;
        const _prev = data.prev;
        const _next = data.next;
        const _xScale = scaleLinear()
          .domain([0, 1])
          .range([chartMargin.left, size.chartWidth - chartMargin.right]);
        const _yScale = scaleBand<number>()
          .domain(range(n + 1))
          .rangeRound([
            chartMargin.top,
            chartMargin.top + size.bar * (n + 1 + 0.1),
          ])
          .padding(0.1);
        setKeyframes(_keyframes);
        setPrev(_prev);
        setNext(_next);
        setXScale(_xScale);
        setYScale(_yScale);
        const svg = create("svg").attr("viewBox", [
          0,
          0,
          size.chartWidth,
          chartHeight,
        ]);
        /* -------------------------------------------------------------------------- */
        /*              TODO: Extract these functions to a separate file              */
        /* -------------------------------------------------------------------------- */
        const bars = () => {
          let bar = svg
            .append("g")
            .attr("fill-opacity", params.opacity.barFill)
            .selectAll("rect");

          return ([date, data]: any, transition: any) =>
            (bar = bar
              .data(data.slice(0, n), (d: any) => d.name)
              .join(
                (enter) =>
                  enter
                    .append("rect")
                    .attr("fill", "rgba(255,255,255,1)")
                    .attr("height", _yScale.bandwidth())
                    .attr("x", _xScale(0))
                    .attr(
                      "y",
                      (d: any) => _yScale((_prev.get(d) || d).rank) as any
                    )
                    .attr(
                      "width",
                      (d: any) =>
                        _xScale((_prev.get(d) || d).value) - _xScale(0)
                    ),
                (update) => update,
                (exit) =>
                  exit
                    .transition(transition)
                    .remove()
                    .attr(
                      "y",
                      (d: any) => _yScale((_next.get(d) || d).rank) as any
                    )
                    .attr(
                      "width",
                      (d: any) =>
                        _xScale((_next.get(d) || d).value) - _xScale(0)
                    )
              )
              .call((bar) =>
                bar
                  .transition(transition)
                  .attr("y", (d: any) => _yScale(d.rank) as any)
                  .attr("width", (d: any) => _xScale(d.value) - _xScale(0))
              ));
        };
        const yAxis = () => {
          const g = svg
            .append("g")
            .attr("transform", `translate(0,${chartMargin.top})`);
          const axis = axisTop(_xScale)
            .ticks(params.size.chartWidth / 160)
            .tickSizeOuter(0)
            .tickSizeInner(-params.size.bar * (n + _yScale.padding()));
          return (_: any, transition: any) => {
            g.transition(transition).call(axis);
            g.select(".tick:first-of-type text").remove();
            g.selectAll(".tick:not(:first-of-type) line").attr(
              "stroke",
              params.color.axisLine
            );
            g.select(".domain").remove();
          };
        };

        /* -------------------------------------------------------------------------- */
        /*             ./TODO: Extract these functions to a separate file             */
        /* -------------------------------------------------------------------------- */
      })
      .catch((error) => {
        console.error(error);
      });
  }, [range, interpolations]);

  if (keyframes.length === 0) return <div>Loading...</div>;

  return <div>RacingBarChart</div>;
}
