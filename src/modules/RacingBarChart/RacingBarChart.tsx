import {
  axisTop,
  create,
  easeLinear,
  format,
  interpolateNumber,
  range,
  scaleBand,
  scaleLinear,
  utcFormat,
} from "d3";
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

  const dateFormat = utcFormat("%Y");
  const numberFormat = format(",d");

  useEffect(() => {
    getKeyframes({ n, interpolations })
      .then(async (data) => {
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

        const textTween = (a: any, b: any) => {
          const i = interpolateNumber(a, b);
          return function (t: any) {
            // @ts-ignore
            this.textContent = numberFormat(i(t));
          };
        };

        const setBars = (
          svg: d3.Selection<SVGSVGElement, undefined, null, undefined>
        ) => {
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

        const setYAxis = (
          svg: d3.Selection<SVGSVGElement, undefined, null, undefined>
        ) => {
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

        const setLabels = (
          svg: d3.Selection<SVGSVGElement, undefined, null, undefined>
        ) => {
          let valueSVG = svg
            .append("g")
            .style("font", "bold 12px var(--sans-serif)")
            .style("font-variant-numeric", "tabular-nums")
            .attr("text-anchor", "end")
            .selectAll("text");

          let rankSVG = svg
            .append("g")
            .style("font", "bold 12px var(--sans-serif)")
            .style("font-variant-numeric", "tabular-nums")
            .attr("text-anchor", "start")
            .selectAll("text");

          let avatarSVG = svg
            .append("g")
            .attr("text-anchor", "middle")
            .selectAll("image");

          return ([date, data]: any, transition: any) => {
            valueSVG = valueSVG
              .data(data.slice(0, n), (d: any) => d.name)
              .join(
                (enter) =>
                  enter
                    .append("text")
                    .attr(
                      "transform",
                      (d) =>
                        `translate(${_xScale(
                          (prev.get(d) || d).value
                        )},${_yScale((prev.get(d) || d).rank)})`
                    )
                    .attr("y", _yScale.bandwidth() / 2)
                    .attr("x", params.size.margin * -1)
                    .attr("dy", "-0.25em")
                    .text((d: any) => d.name)
                    .style("font-weight", "bold")
                    .style("font-style", "italic")
                    .style("font-size", `${params.size.text}px`)
                    .style("fill", params.color.barText)
                    .call((text) =>
                      text
                        .append("tspan")
                        .attr("fill-opacity", params.opacity.barValue)
                        .attr("font-weight", "normal")
                        .attr("x", params.size.margin * -1)
                        .attr("dy", "1.15em")
                    ),
                (update) => update,
                (exit) =>
                  exit
                    .transition(transition)
                    .remove()
                    .attr(
                      "transform",
                      (d) =>
                        `translate(${_xScale(
                          (next.get(d) || d).value
                        )},${_yScale((next.get(d) || d).rank)})`
                    )
                    .call((g) =>
                      g
                        .select("tspan")
                        .tween("text", (d: any) =>
                          textTween(d.value, (next.get(d) || d).value)
                        )
                    )
              )
              .call((bar) =>
                bar
                  .transition(transition)
                  .attr(
                    "transform",
                    (d: any) =>
                      `translate(${_xScale(d.value)},${_yScale(d.rank)})`
                  )
                  .call((g) =>
                    g
                      .select("tspan")
                      .tween("text", (d: any) =>
                        textTween((prev.get(d) || d).value, d.value)
                      )
                  )
              );

            const translateLeft = 0;

            rankSVG = rankSVG
              .data(data.slice(0, n), (d: any) => d.name)
              .join(
                (enter) =>
                  enter
                    .append("text")
                    .attr(
                      "transform",
                      (d) =>
                        `translate(${translateLeft},${_yScale(
                          (prev.get(d) || d).rank
                        )})`
                    )
                    .call((text) =>
                      text
                        .append("tspan")
                        .attr("fill-opacity", 1)
                        .attr("y", _yScale.bandwidth() / 2)
                        .attr("font-weight", "normal")
                        // .attr("dy", "0.35em")
                        .attr("dy", `${params.size.text / 2}px`)
                        .attr("fill", params.color.yTicks)
                        .style("font-size", `${params.size.text}px`)
                    ),
                (update) => update
              )
              .call((bar) =>
                bar
                  .transition(transition)
                  .attr(
                    "transform",
                    (d: any) => `translate(${translateLeft},${_yScale(d.rank)})`
                  )
                  .call((g) =>
                    g
                      .select("tspan")
                      .tween("text", (d: any) =>
                        textTween((prev.get(d) || d).rank + 1, d.rank + 1)
                      )
                  )
              );

            avatarSVG = avatarSVG
              .data(data.slice(0, n), (d: any) => d.name)
              .join(
                (enter) =>
                  enter
                    .append("image")
                    // .attr("xlink:href", (d) => d.avatar)
                    .attr(
                      "xlink:href",
                      (d) =>
                        "https://png.pngtree.com/png-vector/20220817/ourmid/pngtree-cartoon-man-avatar-vector-ilustration-png-image_6111064.png"
                    )
                    .attr("width", params.size.avatar)
                    .attr("height", params.size.avatar)
                    .attr("x", 8)
                    .attr(
                      "y",
                      params.size.bar / 2 -
                        params.size.avatar / 2 -
                        params.size.margin / 2
                    )
                    .attr(
                      "transform",
                      (d: any) =>
                        `translate(${_xScale(
                          (prev.get(d) || d).value
                        )},${_yScale((prev.get(d) || d).rank)})`
                    ),
                (update) => update
              )
              .call((bar) =>
                bar
                  .transition(transition)
                  .attr(
                    "transform",
                    (d: any) =>
                      `translate(${_xScale(d.value)},${_yScale(d.rank)})`
                  )
              );
          };
        };

        const setTicker = (
          svg: d3.Selection<SVGSVGElement, undefined, null, undefined>
        ) => {
          const now = svg
            .append("text")
            .style("font", `bold ${params.size.bar}px var(--sans-serif)`)
            .style("font-variant-numeric", "tabular-nums")
            .attr("text-anchor", "end")
            .attr("x", params.size.chartWidth - params.size.margin)
            .attr("y", chartMargin.top + params.size.bar * (n - 0.45))
            .attr("dy", "0.32em")
            .text(dateFormat(_keyframes[0][0]));

          return ([date]: any, transition: any) => {
            transition.end().then(() => now.text(dateFormat(date)));
          };
        };

        const updateBars = setBars(svg);
        const updateAxis = setYAxis(svg);
        const updateLabels = setLabels(svg);
        const updateTicker = setTicker(svg);

        const chartContainer = document.body.querySelector("#chart");
        const svgNode = svg.node();

        console.log(chartContainer);

        if (chartContainer && svgNode) {
          chartContainer.appendChild(svgNode);

          for (const keyframe of _keyframes) {
            const transition = svg
              .transition()
              .duration(params.animationDuration)
              .ease(easeLinear);

            // Extract the top bar’s value.
            _xScale.domain([0, keyframe[1][0].value]);

            updateAxis(keyframe, transition);
            updateBars(keyframe, transition);
            updateLabels(keyframe, transition);
            updateTicker(keyframe, transition);

            // invalidation.then(() => svg.interrupt());
            await transition.end();
          }
        }

        /* -------------------------------------------------------------------------- */
        /*             ./TODO: Extract these functions to a separate file             */
        /* -------------------------------------------------------------------------- */
      })
      .catch((error) => {
        console.error(error);
      });
  }, [range, interpolations]);

  return (
    <div>
      <div
        id="chart"
        style={{
          width: params.size.chartWidth,
        }}
      ></div>
    </div>
  );
}
