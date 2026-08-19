import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useProducts, useFeaturedProducts } from '../features/products/hooks/useProducts';
import { useCollections } from '../features/collections/hooks/useCollections';
import { ProductGrid } from '../features/products/components/ProductGrid';
import { brandConfig } from '../config/brand';
import { ArrowRight, RotateCcw, Globe, Headphones, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '../shared/components/ui/Button';

export const HomePage: React.FC = () => {
  const { data: featuredProducts, isLoading: loadingFeatured } = useFeaturedProducts();
  const { data: allProducts, isLoading: loadingAll } = useProducts();
  const { data: collections } = useCollections();

  const heroImage =
    featuredProducts?.[0]?.featuredImage ||
    allProducts?.[0]?.featuredImage ||
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=85';

  return (
    <>
      <Helmet>
        <title>{brandConfig.name} — Luxury Ready-to-Wear Fashion Storefront</title>
        <meta
          name="description"
          content="Explore artisanal handcrafted garments, ready-to-wear silhouettes, and accessories on the official MONTS storefront."
        />
      </Helmet>

      <div className="flex flex-col gap-16 md:gap-24 pb-16">
        {/* HERO BANNER */}
        <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden bg-earth-900 text-white">
          <div className="absolute inset-0 z-0">
            <img
              src={heroImage}
              alt="MONTS Luxury Collection"
              className="w-full h-full object-cover opacity-45 scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6">
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-accent-light flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Ready-to-Wear Collection
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Timeless Luxury, Handcrafted Silhouettes
            </h1>
            <p className="text-base sm:text-xl text-slate-200 font-light max-w-xl">
              Explore artisanal craftsmanship and minimalist designs built with premium long-staple fabrics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/collections/all"
                className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-lg bg-white text-primary hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                Shop Collection
              </Link>
              <Link
                to="/collections"
                className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-lg border border-white/50 bg-white/5 backdrop-blur-xs text-white hover:bg-white/15 hover:border-white transition-all"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURED COLLECTIONS */}
        {collections && collections.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 md:px-8 w-full">
            <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-accent block mb-1">
                  Artisanal Heritage
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">
                  Curated Series
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Hand-block prints, quilted cotton textures, and limited luxury batch pieces.
                </p>
              </div>
              <Link
                to="/collections"
                className="text-xs font-semibold text-primary hover:text-accent transition-colors flex items-center gap-1"
              >
                View all collections <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collections.slice(0, 3).map((col) => (
                <Link
                  key={col.id}
                  to={`/collections/${col.handle}`}
                  className="group relative aspect-[4/5] rounded-xl overflow-hidden shadow-card border border-slate-100 flex items-end p-6"
                >
                  <img
                    src={col.image}
                    alt={col.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
                  <div className="relative z-10 text-white flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-light">
                      Artisan Line ({col.productCount} Products)
                    </span>
                    <h3 className="font-serif text-xl font-bold">{col.title}</h3>
                    <span className="text-xs text-slate-300 group-hover:underline flex items-center gap-1 mt-1">
                      Explore series <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FEATURED PRODUCTS */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent block mb-1">
              Signature Collection
            </span>
            <h2 className="font-serif text-3xl font-bold text-primary mb-3">
              Handcrafted Artisanal Essentials
            </h2>
            <p className="text-xs text-slate-500">
              Meticulously handcrafted block-printed cotton totes, quilted travel pouches, and minimalist accessories.
            </p>
          </div>

          <ProductGrid products={featuredProducts} isLoading={loadingFeatured} />
        </section>

        {/* ALL PRODUCTS CATALOG GRID */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent block mb-1">
                Full Catalog
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">
                All Handcrafted Ready-to-Wear & Bags
              </h2>
            </div>
            <Link to="/collections/all" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
              Browse full catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ProductGrid products={allProducts} isLoading={loadingAll} />
        </section>


        {/* VALUE PROPOSITION BAR */}
        <section className="bg-surface-muted py-12 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <RotateCcw className="w-8 h-8 text-accent" />
              <h4 className="font-serif text-base font-bold text-primary">Free returns</h4>
              <p className="text-xs text-slate-500">Returns within 30 days receive a full refund.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Globe className="w-8 h-8 text-accent" />
              <h4 className="font-serif text-base font-bold text-primary">Worldwide shipping</h4>
              <p className="text-xs text-slate-500">Ship anywhere, rates available at checkout.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Headphones className="w-8 h-8 text-accent" />
              <h4 className="font-serif text-base font-bold text-primary">24/7 support</h4>
              <p className="text-xs text-slate-500">Call us anytime at {brandConfig.contact.phone}.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

