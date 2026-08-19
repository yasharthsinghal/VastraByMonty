import React, { useEffect } from 'react';
import { useUIStore } from '../../../shared/store/uiStore';
import { useSearchStore } from '../store/searchStore';
import { useProducts } from '../../products/hooks/useProducts';
import { useCurrency } from '../../../shared/store/currencyStore';
import { Search, X, TrendingUp, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const SearchModal: React.FC = () => {
  const { isSearchModalOpen, closeSearchModal } = useUIStore();
  const { query, setQuery, clearQuery, recentSearches, addRecentSearch } = useSearchStore();
  const { data: products } = useProducts({ searchQuery: query });
  const { formatMoney } = useCurrency();
  const navigate = useNavigate();


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearchModal();
    };
    if (isSearchModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, closeSearchModal]);

  if (!isSearchModalOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addRecentSearch(query.trim());
      closeSearchModal();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleTagClick = (term: string) => {
    setQuery(term);
    addRecentSearch(term);
    closeSearchModal();
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="fixed inset-0 z-[500] flex flex-col bg-white/95 backdrop-blur-md animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-6 max-w-5xl mx-auto w-full flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3">
          <Search className="w-6 h-6 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ready-to-wear, coats, accessories..."
            autoFocus
            className="w-full text-xl md:text-2xl font-serif text-primary bg-transparent focus:outline-none placeholder:text-slate-300"
          />
          {query && (
            <button type="button" onClick={clearQuery} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </form>
        <button
          onClick={closeSearchModal}
          className="p-2 text-slate-500 hover:text-primary transition-colors rounded-full hover:bg-slate-100"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full px-6 py-8">
        {!query ? (
          <div className="flex flex-col gap-8">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" /> Popular Searches
              </h4>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleTagClick(term)}
                    className="px-4 py-2 text-xs font-medium text-slate-700 bg-earth-50 hover:bg-earth-100 border border-earth-100 rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Search Results ({products?.length || 0})
              </h4>
              {products && products.length > 0 && (
                <button
                  onClick={handleSearchSubmit}
                  className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                >
                  View all results <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.handle}`}
                    onClick={closeSearchModal}
                    className="group flex flex-col gap-2"
                  >
                    <div className="aspect-[3/4] bg-earth-50 rounded-lg overflow-hidden border border-slate-100">
                      <img
                        src={product.featuredImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="font-serif text-sm font-semibold text-primary group-hover:text-accent transition-colors line-clamp-1">
                      {product.title}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">{formatMoney(product.price)}</span>
                  </Link>
                ))}
              </div>

            ) : (
              <p className="text-sm text-slate-500 py-8 text-center">
                No products found matching "{query}". Try searching for "blouse", "coat", or "tote".
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
