import { descending } from "d3";

export default function rank(
  value: (name: string) => number,
  names: Iterable<string>,
  n: number
) {
  const data = Array.from(names, (name) => ({
    name,
    value: value(name),
    rank: -1,
  }));
  data.sort((a, b) => descending(a.value, b.value));
  for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
  return data;
}
