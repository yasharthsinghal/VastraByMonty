import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/product.types';
import { Badge } from '../../../shared/components/ui/Badge';
import { useWishlistStore } from '../../../shared/store/wishlistStore';
import { useUIStore } from '../../../shared/store/uiStore';
import { useCartStore } from '../../cart/store/cartStore';
import { useCurrency } from '../../../shared/store/currencyStore';
import { useToast } from '../../../shared/providers/ToastProvider';
import { Heart, Eye, ShoppingBag } from 'lucide-react';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { openQuickView, openCartDrawer } = useUIStore();
  const { addItem } = useCartStore();
  const { formatMoney } = useCurrency();
  const { success } = useToast();


  const isFavorited = isInWishlist(product.id);
  const secondaryImage = product.images[1] || product.featuredImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    success('Added to Cart', `${product.title} was added to your cart.`);
    openCartDrawer();
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      className="group relative flex flex-col h-full bg-white rounded-lg overflow-hidden border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-earth-50">
        <Link to={`/products/${product.handle}`} className="block w-full h-full">
          <img
            src={isHovered ? secondaryImage : product.featuredImage}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {Boolean(product.compareAtPrice && product.compareAtPrice > product.price) && (
            <Badge variant="sale">Sale</Badge>
          )}
          {product.isNew && <Badge variant="new">New</Badge>}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-xs transition-all duration-200 shadow-xs ${
            isFavorited
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-rose-600'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Action Overlay Buttons (Desktop Hover) */}
        <div className="absolute bottom-3 inset-x-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleQuickView}
            className="flex-1 py-2 px-3 bg-white/95 backdrop-blur-xs text-primary text-xs font-semibold rounded shadow-sm hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
          <button
            onClick={handleAddToCart}
            className="p-2 bg-primary text-white text-xs font-semibold rounded shadow-sm hover:bg-accent transition-colors flex items-center justify-center"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
            {product.vendor}
          </span>
          <Link
            to={`/products/${product.handle}`}
            className="font-serif text-sm font-semibold text-primary hover:text-accent transition-colors line-clamp-1"
          >
            {product.title}
          </Link>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-medium text-sm text-primary">
            {formatMoney(product.price)}
          </span>
          {Boolean(product.compareAtPrice && product.compareAtPrice > product.price) && (
            <span className="text-xs text-slate-400 line-through">
              {formatMoney(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

