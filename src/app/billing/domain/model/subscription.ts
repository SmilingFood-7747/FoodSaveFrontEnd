export type PlanId = 'FREE' | 'PLUS';
export type PlanAudience = 'CUSTOMER' | 'BUSINESS_OWNER';
export interface SubscriptionPlan {
  id: PlanId;
  monthlyPrice: number;
  commissionRate: number;
  discountRate: number;
  monthlyDiscountLimit: number;
  activeOfferLimit: number | null;
  exportReports: boolean;
  featuredOffers: boolean;
}
export interface Subscription {
  id: number;
  accountId: number;
  audience: PlanAudience;
  planId: PlanId;
  startsAt: string;
  nextPlanId?: PlanId;
  expiresAt: string | null;
}
export interface SubscriptionCharge {
  id: number;
  accountId: number;
  audience: PlanAudience;
  planId: PlanId | 'PRO';
  amount: number;
  createdAt: string;
  periodStartAt: string;
  periodEndAt: string;
  status: 'SIMULATED';
}
export const PLANS: Record<PlanAudience, readonly SubscriptionPlan[]> = {
  CUSTOMER: [
    {
      id: 'FREE',
      monthlyPrice: 0,
      commissionRate: 0,
      discountRate: 0,
      monthlyDiscountLimit: 0,
      activeOfferLimit: null,
      exportReports: false,
      featuredOffers: false,
    },
    {
      id: 'PLUS',
      monthlyPrice: 9.9,
      commissionRate: 0,
      discountRate: 5,
      monthlyDiscountLimit: 15,
      activeOfferLimit: null,
      exportReports: false,
      featuredOffers: false,
    },
  ],
  BUSINESS_OWNER: [
    {
      id: 'FREE',
      monthlyPrice: 0,
      commissionRate: 5,
      discountRate: 0,
      monthlyDiscountLimit: 0,
      activeOfferLimit: 5,
      exportReports: false,
      featuredOffers: false,
    },
    {
      id: 'PLUS',
      monthlyPrice: 29,
      commissionRate: 7,
      discountRate: 0,
      monthlyDiscountLimit: 0,
      activeOfferLimit: 20,
      exportReports: true,
      featuredOffers: false,
    },
  ],
};
export function cents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100);
}
export function money(amountInCents: number): number {
  return Math.round(amountInCents) / 100;
}
export function monthlyEnd(start: Date): Date {
  const end = new Date(start);
  const day = start.getUTCDate();
  end.setUTCDate(1);
  end.setUTCMonth(end.getUTCMonth() + 1);
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
  end.setUTCDate(Math.min(day, last));
  return end;
}
