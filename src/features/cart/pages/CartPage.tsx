import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCartStore } from '../store/cartStore';
import { useCurrency } from '../../../shared/store/currencyStore';
import { CartItemRow } from '../components/CartItem';
import { Breadcrumb } from '../../../shared/components/ui/Breadcrumb';
import { Button } from '../../../shared/components/ui/Button';
import { brandConfig } from '../../../config/brand';
import { ShoppingBag, ArrowRight, Truck, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CartPage: React.FC = () => {
  const { items, getSubtotal, getTotalQuantity, clearCart, createCheckoutUrl } = useCartStore();
  const { formatMoney } = useCurrency();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = getSubtotal();
  const totalQuantity = getTotalQuantity();
  const threshold = brandConfig.freeShippingThreshold;
  const remaining = threshold - subtotal;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const checkoutUrl = await createCheckoutUrl();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to initialize checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Shopping Cart ({totalQuantity}) — MONTS</title>
        <meta name="description" content="View your shopping cart items." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 flex flex-col gap-8">
        <Breadcrumb items={[{ label: 'Shopping Cart' }]} />

        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h1 className="font-serif text-3xl font-bold text-primary">Your Shopping Cart</h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 bg-surface-muted rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-earth-100 text-earth-800 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-primary mb-2">Your cart is currently empty</h2>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              Before proceeding to checkout you must add some products to your shopping cart.
            </p>
            <Button size="lg">
              <Link to="/collections">Browse Collections</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Items Column */}
            <div className="lg:col-span-2 flex flex-col">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            {/* Summary Column */}
            <div className="flex flex-col gap-6 bg-earth-50 p-6 rounded-xl border border-earth-100 sticky top-24">
              <h3 className="font-serif text-lg font-bold text-primary border-b border-earth-200 pb-3">
                Order Summary
              </h3>

              {/* Free Shipping Alert */}
              <div className="flex items-center gap-2 text-xs font-medium text-earth-900">
                <Truck className="w-4 h-4 text-accent" />
                {remaining <= 0 ? (
                  <span className="font-bold text-emerald-700">You qualify for FREE worldwide shipping!</span>
                ) : (
                  <span>Add <strong>{formatMoney(remaining)}</strong> more for free shipping</span>
                )}
              </div>

              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal ({totalQuantity} items)</span>
                <span className="font-bold text-primary">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-medium text-emerald-700">{remaining <= 0 ? 'FREE' : formatMoney(250)}</span>
              </div>

              <div className="border-t border-earth-200 pt-4 flex justify-between items-center text-lg font-bold text-primary">
                <span>Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatMoney(subtotal + (remaining <= 0 ? 0 : 250))}
                </span>
              </div>

              <Button
                onClick={handleCheckout}
                size="lg"
                className="w-full"
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting to Shopify Checkout…
                  </>
                ) : (
                  <>
                    Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
