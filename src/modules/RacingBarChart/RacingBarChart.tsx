import { create, range, scaleBand, scaleLinear } from "d3";
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
        setKeyframes(data.keyframes);
        setPrev(data.prev);
        setNext(data.next);
        setXScale(
          scaleLinear()
            .domain([0, 1])
            .range([chartMargin.left, size.chartWidth - chartMargin.right])
        );
        setYScale(
          scaleBand<number>()
            .domain(range(n + 1))
            .rangeRound([
              chartMargin.top,
              chartMargin.top + size.bar * (n + 1 + 0.1),
            ])
            .padding(0.1)
        );
        const svg = create("svg").attr("viewBox", [
          0,
          0,
          size.chartWidth,
          chartHeight,
        ]);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [range, interpolations]);

  if (keyframes.length === 0) return <div>Loading...</div>;

  return <div>RacingBarChart</div>;
}
