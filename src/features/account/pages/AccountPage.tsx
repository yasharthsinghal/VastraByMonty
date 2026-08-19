import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../auth/hooks/useAuth';
import { Breadcrumb } from '../../../shared/components/ui/Breadcrumb';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { EmptyState } from '../../../shared/components/ui/EmptyState';
import { Tabs, TabItem } from '../../../shared/components/ui/Tabs';
import { CustomerOrder, CustomerAddress } from '../../auth/types/auth.types';
import {
  LogOut,
  Package,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helper: map Shopify financial/fulfillment status → Badge variant
// ---------------------------------------------------------------------------
function orderStatusVariant(status: string): 'new' | 'accent' | 'sale' | 'secondary' | 'outline' {
  const s = status.toUpperCase();
  if (s === 'PAID') return 'new';
  if (s === 'PENDING') return 'accent';
  if (s === 'REFUNDED' || s === 'VOIDED') return 'sale';
  if (s === 'FULFILLED') return 'new';
  if (s === 'UNFULFILLED') return 'secondary';
  return 'outline';
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatMoney(amount: string, currency: string): string {
  const num = parseFloat(amount);
  return `${currency} ${isNaN(num) ? amount : num.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Orders tab content
// ---------------------------------------------------------------------------
const OrdersTab: React.FC<{ orders: CustomerOrder[] }> = ({ orders }) => {
  if (!orders.length) {
    return (
      <EmptyState
        icon={Package}
        title="No Orders Yet"
        description="When you place your first order, it will appear here."
        actionLabel="Shop Now"
        actionHref="/"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white border border-slate-100 shadow-sm rounded-xl p-5 flex flex-col gap-3"
        >
          {/* Order header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="font-bold text-primary text-sm">{order.name}</span>
              <span className="text-xs text-slate-500 ml-2">· {formatDate(order.processedAt)}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={orderStatusVariant(order.financialStatus)}>
                {order.financialStatus}
              </Badge>
              <Badge variant={orderStatusVariant(order.fulfillmentStatus)}>
                {order.fulfillmentStatus}
              </Badge>
            </div>
          </div>

          {/* Line items preview */}
          {order.lineItems.length > 0 && (
            <ul className="text-xs text-slate-600 flex flex-col gap-1 border-t border-slate-50 pt-3">
              {order.lineItems.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {item.title}
                    {item.variant?.title && item.variant.title !== 'Default Title' && (
                      <span className="text-slate-400 ml-1">— {item.variant.title}</span>
                    )}
                    <span className="text-slate-400 ml-1">× {item.quantity}</span>
                  </span>
                  {item.variant?.price && (
                    <span className="font-medium">
                      {formatMoney(item.variant.price.amount, item.variant.price.currencyCode)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Order footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm font-bold text-primary">
              Total: {formatMoney(order.totalPrice.amount, order.totalPrice.currencyCode)}
            </span>
            {order.statusUrl && (
              <a
                href={order.statusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
              >
                Track Order <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Addresses tab content
// ---------------------------------------------------------------------------
const AddressesTab: React.FC<{ addresses: CustomerAddress[] }> = ({ addresses }) => {
  if (!addresses.length) {
    return (
      <EmptyState
        icon={MapPin}
        title="No Addresses Saved"
        description="Your saved shipping addresses will appear here."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={`bg-white border rounded-xl p-5 flex flex-col gap-2 text-sm shadow-sm ${
            addr.isDefault ? 'border-accent/40 ring-1 ring-accent/20' : 'border-slate-100'
          }`}
        >
          {addr.isDefault && (
            <Badge variant="accent" className="self-start mb-1">
              Default
            </Badge>
          )}
          {(addr.firstName || addr.lastName) && (
            <span className="font-bold text-primary">
              {[addr.firstName, addr.lastName].filter(Boolean).join(' ')}
            </span>
          )}
          {addr.company && <span className="text-slate-500 text-xs">{addr.company}</span>}
          <span className="text-slate-600">{addr.address1}</span>
          {addr.address2 && <span className="text-slate-600">{addr.address2}</span>}
          <span className="text-slate-600">
            {[addr.city, addr.province, addr.zip].filter(Boolean).join(', ')}
          </span>
          <span className="text-slate-600">{addr.country}</span>
          {addr.phone && (
            <span className="text-slate-500 text-xs flex items-center gap-1 mt-1">
              <Phone className="w-3 h-3" /> {addr.phone}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main AccountPage
// ---------------------------------------------------------------------------
export const AccountPage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  const orders = user?.orders ?? [];
  const addresses = user?.addresses ?? [];

  const tabs: TabItem[] = [
    {
      id: 'orders',
      label: `Orders (${orders.length})`,
      content: <OrdersTab orders={orders} />,
    },
    {
      id: 'addresses',
      label: `Addresses (${addresses.length})`,
      content: <AddressesTab addresses={addresses} />,
    },
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading your account…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Account — MONTS</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 flex flex-col gap-8">
        <Breadcrumb items={[{ label: 'My Account' }]} />

        {/* ── Profile Banner ───────────────────────────────── */}
        <div className="bg-earth-50 rounded-2xl p-6 sm:p-8 border border-earth-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-16 h-16 rounded-full shadow-md object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent text-white font-serif text-2xl font-bold flex items-center justify-center shadow-md">
                {user?.firstName?.[0] ?? 'U'}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl font-bold text-primary">
                  {user?.firstName} {user?.lastName}
                </h1>
                <Badge variant={user?.role === 'admin' ? 'accent' : 'secondary'}>
                  {user?.role}
                </Badge>
              </div>

              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </span>

              {user?.phone && (
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {user.phone}
                </span>
              )}

              {user?.ordersCount !== undefined && (
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.ordersCount} order{user.ordersCount !== 1 ? 's' : ''} placed
                </span>
              )}
            </div>
          </div>

          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="text-rose-600 border-rose-200 hover:bg-rose-50 shrink-0"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* ── Tabs: Orders | Addresses ─────────────────────── */}
        <Tabs items={tabs} />
      </div>
    </>
  );
};

