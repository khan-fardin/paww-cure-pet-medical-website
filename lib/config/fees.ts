export const PLATFORM_COMMISSION_RATE = 0.2;
export const PLATFORM_COMMISSION_PERCENT = 20;

export function calculatePaymentSplit(amount: number) {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Payment amount must be a non-negative number");
  }

  const platformFee = Math.round(amount * PLATFORM_COMMISSION_RATE);

  return {
    platformFee,
    vetPayout: Math.max(amount - platformFee, 0),
  };
}
