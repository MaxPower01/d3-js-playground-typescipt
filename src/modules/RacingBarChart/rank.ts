import { descending } from "d3";

export default function rank(params: {
  valueAccessor: (name: string) => number;
  names: Iterable<string>;
  range: number;
}) {
  const { valueAccessor, names, range } = params;
  const data = Array.from(names, (name) => ({
    name,
    value: valueAccessor(name),
    rank: -1,
  }));
  data.sort((a, b) => descending(a.value, b.value));
  for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(range, i);
  return data;
}
