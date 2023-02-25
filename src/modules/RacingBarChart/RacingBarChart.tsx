import { groups, pairs } from "d3";
import { useEffect, useState } from "react";
import getKeyframes from "./getKeyframes";

type Params = {
  /**
   * @name range
   * The number of items to display in the chart.
   * @default 10
   */
  range?: number;

  /**
   * @name interpolations
   * The number of interpolations between key-frames. The higher the number, the smoother the transition between numbers.
   * @default 10
   * @minimum 1 (no interpolation)
   */
  interpolations?: number;

  /**
   * @name animationDuration
   * The duration in milliseconds of the animation when a bar changes position.
   * @default 1000
   */
  animationDuration?: number;

  size?: {
    /**
     * @name avatar
     * The size of the avatar image in pixels.
     * @default 64
     */
    avatar?: number;

    /**
     * @name bar
     * The height of each bar in pixels.
     * @default 96
     */
    bar?: number;

    /**
     * @name text
     * The font size of the text in pixels.
     * @default 32
     */
    text?: number;

    /**
     * @name chartWidth
     * The width of the chart in pixels.
     * @default 1200
     */
    chartWidth?: number;

    /**
     * @name margin
     * The margin between the chart and the edges of the container in pixels. This is also the margin between elements in the chart.
     * @default 8
     */
    margin?: number;
  };

  opacity?: {
    /**
     * @name barFill
     * The opacity of the bar fill (the color of the bar). This doesn't affect other elements in the bar such as the avatar image, the bar title, or the bar value.
     * @default 0.7
     */
    barFill?: number;
    /**
     * @name barTitle
     * The opacity of the bar title.
     * @default 1
     */
    barTitle?: number;
    /**
     * @name barValue
     * The opacity of the bar value.
     * @default 0.7
     */
    barValue?: number;
  };

  color?: {
    /**
     * @name barText
     * The color of the text in the bars.
     * @default "rgba(0,0,0,1)"
     */
    barText?: string;

    /**
     * @name axisLine
     * The color of the axis line.
     * @default "rgba(255,255,255,0.25)"
     */
    axisLine?: string;

    /**
     * @name yTicks
     * The color of the y-axis ticks.
     * @default "rgba(255,255,255,1)"
     */
    yTicks?: string;
  };
};

export default function RacingBarChart(params: Params) {
  const {
    range = 10,
    interpolations = 10,
    animationDuration = 1000,
    size = {
      avatar: 64,
      bar: 96,
      text: 32,
      chartWidth: 1200,
      margin: 8,
    },
    opacity = {
      barFill: 0.7,
      barTitle: 1,
      barValue: 0.7,
    },
    color = {
      barText: "rgba(0,0,0,1)",
      axisLine: "rgba(255,255,255,0.25)",
      yTicks: "rgba(255,255,255,1)",
    },
  } = params;

  const [keyframes, setKeyframes] = useState<any[]>([]);
  const [prev, setPrev] = useState<Map<any, any>>(new Map());
  const [next, setNext] = useState<Map<any, any>>(new Map());

  useEffect(() => {
    getKeyframes({ range, interpolations })
      .then((_keyframes) => {
        const _nameframes = groups(
          keyframes.flatMap(([, data]) => data),
          (d) => d.name
        );
        const _prev = new Map(
          _nameframes.flatMap(([, data]) => pairs(data, (a, b) => [b, a]))
        );
        const _next = new Map(_nameframes.flatMap(([, data]) => pairs(data)));
        setKeyframes(_keyframes);
        setPrev(_prev);
        setNext(_next);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [range, interpolations]);

  if (keyframes.length === 0) return <div>Loading...</div>;
  return <div>RacingBarChart</div>;
}
