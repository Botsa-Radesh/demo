export function calculateCoinsEarned(
  amount: number,
  paymentMethod: string,
  isSplitPayment: boolean,
  streakOrders: number
): { earned: number; breakdown: { base: number; split: number; streak: number } } {
  let base = 0;
  let split = 0;
  let streak = 0;

  if (paymentMethod === 'amazon_pay') {
    base = Math.floor(amount * 0.05);
    if (isSplitPayment) split = Math.floor(amount * 0.02);
    if (streakOrders >= 3) streak = Math.floor(amount * 0.03);
  }

  const earned = base + split + streak;
  return { earned, breakdown: { base, split, streak } };
}

export function calculateMissedCoins(
  amount: number,
  isSplitPayment: boolean,
  streakOrders: number
): number {
  const amazonPayCoins = calculateCoinsEarned(amount, 'amazon_pay', isSplitPayment, streakOrders);
  return amazonPayCoins.earned;
}

export function getRedeemOptions() {
  return [
    { label: '₹10 Off', cost: 1000 },
    { label: 'Free Delivery', cost: 5000 },
    { label: '₹150 Voucher', cost: 10000 },
  ];
}

export function getNextMilestone(currentCoins: number): { label: string; remaining: number; progress: number } {
  const options = getRedeemOptions();
  for (const opt of options) {
    if (currentCoins < opt.cost) {
      return { label: opt.label, remaining: opt.cost - currentCoins, progress: currentCoins / opt.cost };
    }
  }
  return { label: 'All Unlocked!', remaining: 0, progress: 1 };
}
