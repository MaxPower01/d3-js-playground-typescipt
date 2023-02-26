import { useEffect, useState } from "react";
import getKeyframes from "./getKeyframes";
import { RacingBarChartParams, RacingChartKeyframe } from "./types";

export default function RacingBarChart(params: RacingBarChartParams) {
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

  const [keyframes, setKeyframes] = useState<RacingChartKeyframe[]>([]);
  const [prev, setPrev] = useState<Map<any, any>>(new Map());
  const [next, setNext] = useState<Map<any, any>>(new Map());

  useEffect(() => {
    getKeyframes({ range, interpolations })
      .then((data) => {
        setKeyframes(data.keyframes);
        setPrev(data.prev);
        setNext(data.next);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [range, interpolations]);

  if (keyframes.length === 0) return <div>Loading...</div>;

  return (
    <div>
      {keyframes.map((keyframe, index) => {
        // return <div key={index}>{keyframe}</div>;
        return (
          <div key={index}>
            <div
              style={{
                fontWeight: "bold",
              }}
            >
              {keyframe[0].toLocaleDateString()}
            </div>
            <div>
              {keyframe[1].map((item, index) => {
                return (
                  <div key={index}>
                    {item.name} - {item.value}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
