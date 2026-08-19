import React, { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { useUIStore } from '../../../shared/store/uiStore';
import { useCartStore } from '../../cart/store/cartStore';
import { useCurrency } from '../../../shared/store/currencyStore';
import { useToast } from '../../../shared/providers/ToastProvider';
import { Button } from '../../../shared/components/ui/Button';
import { SubscriptionSelector } from './SubscriptionSelector';
import { PurchaseType } from '../../cart/types/cart.types';
import { SellingPlan } from '../types/product.types';
import { ShoppingBag, Check } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, closeQuickView, openCartDrawer } = useUIStore();
  const { addItem, items } = useCartStore();
  const { formatMoney } = useCurrency();
  const { success } = useToast();

  const [selectedOption, setSelectedOption] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('one-time');
  const [selectedSellingPlan, setSelectedSellingPlan] = useState<SellingPlan | undefined>(undefined);

  if (!quickViewProduct) return null;

  const selectedVariant =
    quickViewProduct.variants.find((v) => {
      if (!v.options || v.options.length === 0) return true;
      return v.options.every(
        (opt) => (selectedOption[opt.name] || quickViewProduct.options.find((o) => o.name === opt.name)?.values[0]) === opt.value
      );
    }) || quickViewProduct.variants[0];

  const existingCartItem = items.find(
    (item) => item.productId === quickViewProduct.id && (!selectedVariant || item.variantId === selectedVariant.id)
  );
  const isInCart = !!existingCartItem;

  const currentPrice = selectedVariant?.price || quickViewProduct.price;
  const currentCompareAtPrice = selectedVariant?.compareAtPrice || quickViewProduct.compareAtPrice;
  const isAvailable = quickViewProduct.available && (selectedVariant ? selectedVariant.available : true);

  const discountPercent = purchaseType === 'subscription' ? (selectedSellingPlan?.discountPercentage || 10) : 0;
  const effectiveUnitPrice = purchaseType === 'subscription'
    ? currentPrice * (1 - discountPercent / 100)
    : currentPrice;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addItem(quickViewProduct, selectedVariant, quantity, purchaseType, purchaseType === 'subscription' ? selectedSellingPlan : undefined);
    const planText = purchaseType === 'subscription' ? ` (${selectedSellingPlan?.name || 'Subscription'})` : '';
    success('Added to Cart', `${quantity}x ${quickViewProduct.title}${planText} added to your cart.`);
    closeQuickView();
    openCartDrawer();
  };

  return (
    <Modal isOpen={!!quickViewProduct} onClose={closeQuickView} maxWidth="4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Gallery */}
        <div className="aspect-[3/4] bg-earth-50 rounded-lg overflow-hidden border border-slate-100">
          <img
            src={selectedVariant?.image || quickViewProduct.featuredImage}
            alt={quickViewProduct.title}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Right: Info */}
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1">
              {quickViewProduct.vendor}
            </span>
            <h2 className="font-serif text-2xl font-bold text-primary mb-2">{quickViewProduct.title}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                {quickViewProduct.category || 'Ready-to-Wear'}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 text-xl font-bold text-primary border-y border-slate-100 py-3">
            <span>{formatMoney(effectiveUnitPrice)}</span>
            {purchaseType === 'subscription' && (
              <span className="text-sm text-slate-400 line-through font-normal">
                {formatMoney(currentPrice)}
              </span>
            )}
            {purchaseType === 'one-time' && currentCompareAtPrice && currentCompareAtPrice > currentPrice && (
              <span className="text-sm text-slate-400 line-through font-normal">
                {formatMoney(currentCompareAtPrice)}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
            {quickViewProduct.description}
          </p>

          {/* Options */}
          {quickViewProduct.options.map((opt) => (
            <div key={opt.name} className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                {opt.name}: <span className="font-normal text-slate-500">{selectedOption[opt.name] || opt.values[0]}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {opt.values.map((val) => {
                  const isSelected = (selectedOption[opt.name] || opt.values[0]) === val;
                  return (
                    <button
                      key={val}
                      onClick={() => setSelectedOption((prev) => ({ ...prev, [opt.name]: val }))}
                      className={`px-3 py-1.5 text-xs font-medium border rounded transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Subscription Options */}
          <SubscriptionSelector
            basePrice={currentPrice}
            purchaseType={purchaseType}
            onPurchaseTypeChange={setPurchaseType}
            selectedSellingPlan={selectedSellingPlan}
            onSellingPlanChange={setSelectedSellingPlan}
            availableSellingPlans={quickViewProduct.sellingPlanGroups?.[0]?.sellingPlans}
          />

          {/* Quantity & Add to Cart or Go to Cart */}
          {isInCart ? (
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-earth-100/70 border border-earth-200 rounded-lg text-xs font-semibold text-earth-900">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Item already in your cart (Qty: {existingCartItem.quantity})
                </span>
              </div>

              <Button
                onClick={() => {
                  closeQuickView();
                  openCartDrawer();
                }}
                size="lg"
                className="w-full"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Go to Cart
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center border border-slate-300 rounded-md">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-slate-500 hover:text-primary transition-colors text-sm"
                  disabled={!isAvailable}
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm font-semibold text-primary">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-slate-500 hover:text-primary transition-colors text-sm"
                  disabled={!isAvailable}
                >
                  +
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                className="flex-1"
                disabled={!isAvailable}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {isAvailable ? `Add to Cart — ${formatMoney(effectiveUnitPrice * quantity)}` : 'Sold Out'}
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium pt-2">
            <Check className="w-4 h-4" />
            {isAvailable
              ? 'In stock, ready to ship with free returns within 30 days.'
              : 'Item currently out of stock.'}
          </div>
        </div>
      </div>
    </Modal>
  );
};



