import { ascending, csv, groups, pairs, rollup } from "d3";
import rank from "./rank";
import { RacingChartKeyframe } from "./types";

export default async function getKeyframes(params: {
  range: number;
  interpolations: number;
}) {
  const data = await csv("/category-brands.csv");
  const names = new Set(data.map((d) => d.name ?? ""));
  const dateValues = Array.from(
    rollup(
      data,
      ([d]) => d.value ?? "",
      (d) => d.date ?? "",
      (d) => d.name ?? ""
    )
  )
    .map(([date, data]) => [new Date(date), data])
    .sort(([a], [b]) => ascending(a as Date, b as Date));
  const { range, interpolations } = params;
  const keyframes: RacingChartKeyframe[] = [];
  let ka: any;
  let a: any;
  let kb: any;
  let b: any;
  for ([[ka, a], [kb, b]] of pairs(dateValues)) {
    for (let i = 0; i < interpolations; ++i) {
      const t = i / interpolations;
      keyframes.push([
        new Date(ka * (1 - t) + kb * t),
        rank({
          valueAccessor: (name) =>
            (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t,
          names,
          range,
        }),
      ]);
    }
  }
  keyframes.push([
    new Date(kb),
    rank({
      valueAccessor: (name) => b.get(name) || 0,
      names,
      range,
    }),
  ]);
  const nameframes = groups(
    keyframes.flatMap(
      ([, data]) => data as { name: string; value: number; rank: number }[]
    ),
    (d) => d.name
  );
  const prev = new Map(
    nameframes.flatMap(([, data]) => pairs(data, (a, b) => [b, a]))
  );
  const next = new Map(nameframes.flatMap(([, data]) => pairs(data)));
  return {
    keyframes,
    prev,
    next,
  };
}
