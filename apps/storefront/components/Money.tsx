import { formatInr } from "@/lib/format";

export function Money({ amount }: { amount: number }) {
  return <span className="tabular-nums">{formatInr(amount)}</span>;
}
