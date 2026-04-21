export interface WeightedItem {
  value: number;
  weight: number;
}

export function weightedPick(items: readonly WeightedItem[], rnd = Math.random): number {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = rnd() * total;

  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item.value;
  }

  // Fallback to last item (floating point edge case)
  return items[items.length - 1].value;
}
