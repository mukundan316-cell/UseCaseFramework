export type CurrencyCode = 'GBP' | 'USD' | 'EUR' | 'CAD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  defaultHourlyRate: number;
}

export const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyConfig> = {
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    defaultHourlyRate: 45
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    defaultHourlyRate: 55
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    defaultHourlyRate: 50
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    defaultHourlyRate: 60
  }
};

export const DEFAULT_CURRENCY: CurrencyCode = 'GBP';

export function getCurrencyConfig(code?: string): CurrencyConfig {
  if (code && code in CURRENCY_CONFIG) {
    return CURRENCY_CONFIG[code as CurrencyCode];
  }
  return CURRENCY_CONFIG[DEFAULT_CURRENCY];
}

export function formatCurrency(value: number, currencyCode?: string): string {
  const config = getCurrencyConfig(currencyCode);
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatCurrencyRange(min: number, max: number, currencyCode?: string): string {
  const config = getCurrencyConfig(currencyCode);
  const formatter = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
}

export function getHourlyRate(currencyCode?: string): number {
  return getCurrencyConfig(currencyCode).defaultHourlyRate;
}
