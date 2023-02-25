import { ascending, csv, rollup } from "d3";

export default async function fetchData() {
  const data = await csv("/category-brands.csv");
  const names = new Set(data.map((d) => d.name ?? ""));
  const datevalues = Array.from(
    rollup(
      data,
      ([d]) => d.value ?? "",
      (d) => d.date ?? "",
      (d) => d.name ?? ""
    )
  )
    .map(([date, data]) => [new Date(date), data])
    .sort(([a], [b]) => ascending(a as Date, b as Date));
  return { datevalues, names };
}
