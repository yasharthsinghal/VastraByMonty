import React from 'react';
import { SellingPlan } from '../types/product.types';
import { PurchaseType } from '../../cart/types/cart.types';
import { useCurrency } from '../../../shared/store/currencyStore';
import { Sparkles, Calendar, Check, ShieldCheck } from 'lucide-react';

interface SubscriptionSelectorProps {
  basePrice: number;
  purchaseType: PurchaseType;
  onPurchaseTypeChange: (type: PurchaseType) => void;
  selectedSellingPlan: SellingPlan | undefined;
  onSellingPlanChange: (plan: SellingPlan) => void;
  availableSellingPlans?: SellingPlan[];
}

const DEFAULT_SUBSCRIPTION_PLANS: SellingPlan[] = [
  {
    id: 'sub_1m',
    name: 'Deliver every 1 Month',
    description: 'Auto-delivers every 30 days. Most popular for luxury daily essentials.',
    discountPercentage: 10,
    frequencyMonths: 1,
  },
  {
    id: 'sub_2m',
    name: 'Deliver every 2 Months',
    description: 'Auto-delivers every 60 days.',
    discountPercentage: 10,
    frequencyMonths: 2,
  },
  {
    id: 'sub_3m',
    name: 'Deliver every 3 Months',
    description: 'Seasonal luxury refresh every quarter.',
    discountPercentage: 10,
    frequencyMonths: 3,
  },
];

export const SubscriptionSelector: React.FC<SubscriptionSelectorProps> = ({

  basePrice,
  purchaseType,
  onPurchaseTypeChange,
  selectedSellingPlan,
  onSellingPlanChange,
  availableSellingPlans,
}) => {
  const { formatMoney } = useCurrency();
  const plans = availableSellingPlans && availableSellingPlans.length > 0
    ? availableSellingPlans
    : DEFAULT_SUBSCRIPTION_PLANS;

  const currentPlan = selectedSellingPlan || plans[0];
  const discountPercent = currentPlan.discountPercentage || 10;
  const subscriptionPrice = basePrice * (1 - discountPercent / 100);

  return (
    <div className="flex flex-col gap-3 p-4 bg-earth-50/70 border border-earth-200 rounded-xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" /> Purchase Options
        </span>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          Shopify Subscription
        </span>
      </div>

      {/* Option 1: One-time Purchase */}
      <label
        onClick={() => onPurchaseTypeChange('one-time')}
        className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
          purchaseType === 'one-time'
            ? 'bg-white border-primary ring-1 ring-primary shadow-xs'
            : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name="purchase-type"
            checked={purchaseType === 'one-time'}
            onChange={() => onPurchaseTypeChange('one-time')}
            className="text-primary focus:ring-primary h-4 w-4"
          />
          <div>
            <span className="text-xs font-bold text-primary block">One-Time Purchase</span>
            <span className="text-[11px] text-slate-500">Standard single order</span>
          </div>
        </div>
        <span className="text-sm font-bold text-primary">{formatMoney(basePrice)}</span>
      </label>

      {/* Option 2: Subscribe & Save */}
      <div
        className={`flex flex-col gap-3 p-3.5 rounded-lg border transition-all ${
          purchaseType === 'subscription'
            ? 'bg-white border-accent ring-1 ring-accent shadow-xs'
            : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
        }`}
      >
        <label
          onClick={() => onPurchaseTypeChange('subscription')}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="purchase-type"
              checked={purchaseType === 'subscription'}
              onChange={() => onPurchaseTypeChange('subscription')}
              className="text-accent focus:ring-accent h-4 w-4"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary">Subscribe & Save {discountPercent}%</span>
                <span className="text-[10px] font-extrabold uppercase bg-accent text-white px-1.5 py-0.2 rounded">
                  Best Value
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Automated recurring delivery</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-accent block">{formatMoney(subscriptionPrice)}</span>
            <span className="text-[10px] text-slate-400 line-through">{formatMoney(basePrice)}</span>
          </div>
        </label>

        {/* Subscription Frequency Dropdown */}
        {purchaseType === 'subscription' && (
          <div className="flex flex-col gap-2 pt-2 border-t border-earth-100 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-accent" /> Frequency:
              </span>
              <select
                value={currentPlan.id}
                onChange={(e) => {
                  const p = plans.find((item) => item.id === e.target.value);
                  if (p) onSellingPlanChange(p);
                }}
                className="bg-earth-50 border border-earth-200 text-primary text-xs font-semibold rounded-md px-2.5 py-1.5 focus:outline-none focus:border-accent"
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} ({plan.discountPercentage || 10}% off)
                  </option>
                ))}
              </select>
            </div>

            {/* Subscriber Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <Check className="w-3 h-3 text-emerald-600" /> Cancel or pause anytime
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <ShieldCheck className="w-3 h-3 text-accent" /> Fulfilled by Shopify
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};