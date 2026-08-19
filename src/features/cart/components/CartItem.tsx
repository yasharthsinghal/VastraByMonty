import React from 'react';
import { CartItem as ICartItem } from '../types/cart.types';
import { useCartStore } from '../store/cartStore';
import { useCurrency } from '../../../shared/store/currencyStore';
import { Trash2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CartItemRow: React.FC<{ item: ICartItem }> = ({ item }) => {
  const { removeItem, updateQuantity, getItemUnitPrice } = useCartStore();
  const { formatMoney } = useCurrency();

  const unitPrice = getItemUnitPrice(item);
  const isSubscription = item.purchaseType === 'subscription';

  return (
    <div className="flex gap-4 py-4 border-b border-slate-100 last:border-0">
      <Link to={`/products/${item.product.handle}`} className="w-20 h-24 bg-earth-50 rounded overflow-hidden flex-shrink-0">
        <img
          src={item.variant.image || item.product.featuredImage}
          alt={item.product.title}
          className="w-full h-full object-cover object-center"
        />
      </Link>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <Link
              to={`/products/${item.product.handle}`}
              className="font-serif text-sm font-semibold text-primary hover:text-accent transition-colors line-clamp-1"
            >
              {item.product.title}
            </Link>
            <button
              onClick={() => removeItem(item.id)}
              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {item.variant.title && item.variant.title !== 'Default' && item.variant.title !== 'Default Title' && (
            <p className="text-xs text-slate-500 mt-0.5">{item.variant.title}</p>
          )}

          {isSubscription && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full">
                <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
                {item.sellingPlan?.name || 'Subscription'} ({item.subscriptionDiscount || 10}% Off)
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-primary">{formatMoney(unitPrice)}</span>
            {isSubscription && (
              <span className="text-[10px] text-slate-400 line-through">
                {formatMoney(item.variant.price || item.product.price)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
          {/* Edit Quantity on Cart */}
          <div className="flex items-center border border-slate-200 rounded-md bg-white">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="px-2.5 py-1 text-slate-500 hover:text-primary hover:bg-slate-50 transition-colors text-xs font-bold"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="px-2.5 py-1 text-xs font-bold text-primary min-w-[28px] text-center select-none">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="px-2.5 py-1 text-slate-500 hover:text-primary hover:bg-slate-50 transition-colors text-xs font-bold"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <span className="text-xs font-bold text-primary">
            {formatMoney(unitPrice * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
};



