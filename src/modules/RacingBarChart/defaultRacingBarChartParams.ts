import { RacingBarChartParams } from "./types";

const defaultRacingBarChartParams: RacingBarChartParams = {
  n: 10,
  interpolations: 10,
  animationDuration: 1000,
  size: {
    avatar: 64,
    bar: 96,
    text: 32,
    chartWidth: 1200,
    margin: 8,
  },
  opacity: {
    barFill: 0.7,
    barTitle: 1,
    barValue: 0.7,
  },
  color: {
    barText: "rgba(0,0,0,1)",
    axisLine: "rgba(255,255,255,0.25)",
    yTicks: "rgba(255,255,255,1)",
  },
};

export default defaultRacingBarChartParams;
