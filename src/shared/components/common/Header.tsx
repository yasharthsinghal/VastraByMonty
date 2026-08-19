import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnnouncementBar } from './AnnouncementBar';
import { Navigation } from './Navigation';
import { useUIStore } from '../../store/uiStore';
import { useCartStore } from '../../../features/cart/store/cartStore';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { useCurrency } from '../../store/currencyStore';
import { brandConfig } from '../../../config/brand';
import { Search, ShoppingBag, User, Menu, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { openCartDrawer, openMobileNav, openSearchModal } = useUIStore();
  const { getTotalQuantity, getSubtotal } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  const { currentCurrency, setCurrency, formatMoney, currencies } = useCurrency();

  const totalQuantity = getTotalQuantity();
  const subtotal = getSubtotal();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white w-full transition-shadow duration-300">
      <AnnouncementBar />

      <div
        className={`w-full border-b border-slate-100 transition-all duration-300 ${
          isScrolled ? 'shadow-sm py-2' : 'py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu & Desktop Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={openMobileNav}
              className="md:hidden p-2 text-slate-700 hover:text-primary transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Navigation />
          </div>

          {/* Center: Brand Logo */}
          <Link to="/" className="font-serif text-2xl md:text-3xl font-extrabold tracking-wider text-primary">
            {brandConfig.name}
          </Link>

          {/* Right: Actions (Search, Currency, Account, Cart) */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Currency Selector */}
            <div className="hidden lg:flex items-center text-xs font-semibold text-slate-600 gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
              <Globe className="w-3.5 h-3.5 text-accent" />
              <select
                value={currentCurrency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer text-xs font-semibold text-primary"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Trigger */}
            <button
              onClick={openSearchModal}
              className="p-2 text-slate-700 hover:text-primary transition-colors"
              aria-label="Search storefront"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account Icon */}
            <Link
              to={isAuthenticated ? '/account' : '/login'}
              className="hidden sm:flex items-center text-slate-700 hover:text-primary transition-colors p-2"
              aria-label="My account"
            >
              <User className="w-5 h-5" />
              {isAuthenticated && (
                <span className="ml-1.5 text-xs font-semibold text-primary">
                  {user?.firstName}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={openCartDrawer}
              className="flex items-center gap-2 p-2 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-hover transition-colors shadow-xs"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-white text-primary text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {formatMoney(subtotal)} ({totalQuantity})
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

