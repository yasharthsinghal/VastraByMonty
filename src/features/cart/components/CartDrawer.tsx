import React, { useState } from 'react';
import { Drawer } from '../../../shared/components/ui/Drawer';
import { useUIStore } from '../../../shared/store/uiStore';
import { useCartStore } from '../store/cartStore';
import { useCurrency } from '../../../shared/store/currencyStore';
import { CartItemRow } from './CartItem';
import { Button } from '../../../shared/components/ui/Button';
import { brandConfig } from '../../../config/brand';
import { ShoppingBag, ArrowRight, Truck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { isCartDrawerOpen, closeCartDrawer } = useUIStore();
  const { items, getSubtotal, getTotalQuantity, createCheckoutUrl } = useCartStore();
  const { formatMoney } = useCurrency();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = getSubtotal();
  const totalQuantity = getTotalQuantity();
  const threshold = brandConfig.freeShippingThreshold;
  const progress = Math.min(100, (subtotal / threshold) * 100);
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
    <Drawer isOpen={isCartDrawerOpen} onClose={closeCartDrawer} title={`Your Cart (${totalQuantity})`}>
      <div className="flex flex-col h-full justify-between">
        {/* Free Shipping Progress */}
        <div className="bg-earth-50 p-3 rounded-lg mb-4 border border-earth-100">
          <div className="flex items-center justify-between text-xs font-medium text-earth-900 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-accent" />
              {remaining <= 0 ? (
                <span className="font-semibold text-emerald-700">You qualify for FREE worldwide shipping!</span>
              ) : (
                <span>Add <strong className="text-primary">{formatMoney(remaining)}</strong> more for FREE shipping</span>
              )}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                remaining <= 0 ? 'bg-emerald-600' : 'bg-accent'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <p className="font-serif text-lg font-bold text-primary mb-1">Your cart is empty.</p>
            <p className="text-xs text-slate-500 max-w-xs mb-6">
              Explore our ready-to-wear collections and discover curated luxury silhouettes.
            </p>
            <Button onClick={closeCartDrawer} variant="outline" size="sm">
              <Link to="/collections">Continue browsing</Link>
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Cart Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 pt-4 mt-4 flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm font-semibold text-primary">
              <span>Subtotal</span>
              <span className="text-base font-bold">{formatMoney(subtotal)}</span>
            </div>
            <p className="text-[11px] text-slate-500">Shipping & taxes calculated at checkout.</p>
            
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleCheckout}
                className="w-full"
                size="lg"
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting to Shopify Checkout…
                  </>
                ) : (
                  <>
                    Checkout <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              <Button
                onClick={closeCartDrawer}
                variant="outline"
                size="md"
                className="w-full"
              >
                <Link to="/cart">View Full Cart</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

