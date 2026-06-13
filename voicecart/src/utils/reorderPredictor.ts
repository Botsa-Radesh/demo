import { Order, Product } from '@/types';

export interface ReorderPrediction {
  product: { id: string; name: string; emoji: string; price: number };
  avgIntervalDays: number;
  daysSinceLastOrder: number;
  urgency: 'high' | 'medium' | 'low';
  suggestedQuantity: number;
}

export interface ReorderSummary {
  predictions: ReorderPrediction[];
  totalItems: number;
  totalCost: number;
}

export function predictReorder(
  history: Order[],
  productCatalog: Product[]
): ReorderSummary {
  if (history.length < 2) {
    return { predictions: [], totalItems: 0, totalCost: 0 };
  }

  const sortedOrders = [...history].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const purchaseLog: Record<string, number[]> = {};
  for (const order of sortedOrders) {
    const orderDate = new Date(order.date).getTime();
    for (const item of order.items) {
      const pid = item.product.id;
      if (!purchaseLog[pid]) purchaseLog[pid] = [];
      purchaseLog[pid].push(orderDate);
    }
  }

  const now = Date.now();
  const predictions: ReorderPrediction[] = [];

  for (const [productId, dates] of Object.entries(purchaseLog)) {
    if (dates.length < 2) continue;

    const intervals: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      intervals.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
    }

    const avgInterval = intervals.reduce((s, v) => s + v, 0) / intervals.length;
    if (avgInterval <= 0) continue;

    const lastDate = dates[dates.length - 1];
    const daysSinceLastOrder = (now - lastDate) / (1000 * 60 * 60 * 24);

    if (daysSinceLastOrder <= avgInterval * 0.8) continue;

    const ratio = daysSinceLastOrder / avgInterval;
    let urgency: 'high' | 'medium' | 'low';
    if (ratio >= 2) urgency = 'high';
    else if (ratio >= 1.3) urgency = 'medium';
    else urgency = 'low';

    const product = productCatalog.find(p => p.id === productId);
    if (!product) continue;

    predictions.push({
      product: { id: product.id, name: product.name, emoji: product.emoji, price: product.price },
      avgIntervalDays: Math.round(avgInterval * 10) / 10,
      daysSinceLastOrder: Math.round(daysSinceLastOrder * 10) / 10,
      urgency,
      suggestedQuantity: Math.max(1, Math.round(daysSinceLastOrder / avgInterval)),
    });
  }

  predictions.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.urgency] - order[b.urgency];
  });

  return {
    predictions,
    totalItems: predictions.reduce((s, p) => s + p.suggestedQuantity, 0),
    totalCost: predictions.reduce((s, p) => s + p.suggestedQuantity * p.product.price, 0),
  };
}

export function getUrgencyColor(urgency: 'high' | 'medium' | 'low'): string {
  switch (urgency) {
    case 'high': return '#d32f2f';
    case 'medium': return '#f57c00';
    case 'low': return '#388e3c';
  }
}
