import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
  rateFromINR: number; // 1 INR = X target currency
  decimals: number;
}

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  INR: { code: 'INR', symbol: 'Rs.', label: 'INR (Rs.)', rateFromINR: 1, decimals: 2 },
  USD: { code: 'USD', symbol: '$', label: 'USD ($)', rateFromINR: 0.012, decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€)', rateFromINR: 0.011, decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£)', rateFromINR: 0.0095, decimals: 2 },
  AED: { code: 'AED', symbol: 'AED', label: 'AED (د.إ)', rateFromINR: 0.044, decimals: 2 },
  CAD: { code: 'CAD', symbol: 'CA$', label: 'CAD ($)', rateFromINR: 0.016, decimals: 2 },
  AUD: { code: 'AUD', symbol: 'AU$', label: 'AUD ($)', rateFromINR: 0.018, decimals: 2 },
};

interface CurrencyStoreState {
  currentCurrency: string;
  setCurrency: (code: string) => void;
  formatMoney: (amountInBaseCurrency: number | undefined | null) => string;
  convertAmount: (amountInBaseCurrency: number | undefined | null) => number;
}

export const useCurrencyStore = create<CurrencyStoreState>()(
  persist(
    (set, get) => ({
      currentCurrency: 'INR',

      setCurrency: (code: string) => {
        if (CURRENCY_CONFIGS[code]) {
          set({ currentCurrency: code });
        }
      },

      convertAmount: (amount: number | undefined | null): number => {
        if (amount === undefined || amount === null || isNaN(amount)) return 0;
        const currency = get().currentCurrency;
        const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.INR;
        return amount * config.rateFromINR;
      },

      formatMoney: (amount: number | undefined | null): string => {
        if (amount === undefined || amount === null || isNaN(amount)) return 'Rs. 0.00';
        const currency = get().currentCurrency;
        const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.INR;
        const converted = amount * config.rateFromINR;

        if (config.code === 'INR') {
          return `Rs. ${converted.toFixed(config.decimals)}`;
        }
        if (config.code === 'AED') {
          return `AED ${converted.toFixed(config.decimals)}`;
        }
        return `${config.symbol}${converted.toFixed(config.decimals)}`;
      },
    }),
    {
      name: 'monts-currency-preference',
    }
  )
);

export function useCurrency() {
  const currentCurrency = useCurrencyStore((s) => s.currentCurrency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const formatMoney = useCurrencyStore((s) => s.formatMoney);
  const convertAmount = useCurrencyStore((s) => s.convertAmount);

  return {
    currentCurrency,
    setCurrency,
    formatMoney,
    convertAmount,
    currencies: Object.values(CURRENCY_CONFIGS),
    currencyConfig: CURRENCY_CONFIGS[currentCurrency] || CURRENCY_CONFIGS.INR,
  };
}