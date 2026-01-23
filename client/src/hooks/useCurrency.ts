import { useMemo } from 'react';
import { useEngagement } from '@/contexts/EngagementContext';
import { useQuery } from '@tanstack/react-query';
import { 
  CurrencyCode, 
  CurrencyConfig, 
  CURRENCY_CONFIG, 
  DEFAULT_CURRENCY, 
  getCurrencyConfig as getConfig,
  formatCurrency as formatValue,
  formatCurrencyRange as formatRange,
  getHourlyRate as getRate
} from '@shared/currency';

export interface UseCurrencyResult {
  currencyCode: CurrencyCode;
  config: CurrencyConfig;
  symbol: string;
  hourlyRate: number;
  format: (value: number) => string;
  formatRange: (min: number, max: number) => string;
  formatCompact: (value: number) => string;
}

export function useCurrency(): UseCurrencyResult {
  const { selectedClientId } = useEngagement();
  
  const { data: client } = useQuery<{ currency?: string }>({
    queryKey: [`/api/clients/${selectedClientId}`],
    enabled: !!selectedClientId,
  });
  
  const clientCurrency = client?.currency;
  
  return useMemo(() => {
    const currencyCode = (clientCurrency && clientCurrency in CURRENCY_CONFIG) 
      ? clientCurrency as CurrencyCode 
      : DEFAULT_CURRENCY;
    
    const config = getConfig(currencyCode);
    
    return {
      currencyCode,
      config,
      symbol: config.symbol,
      hourlyRate: config.defaultHourlyRate,
      format: (value: number) => formatValue(value, currencyCode),
      formatRange: (min: number, max: number) => formatRange(min, max, currencyCode),
      formatCompact: (value: number) => {
        const formatter = new Intl.NumberFormat(config.locale, {
          style: 'currency',
          currency: config.code,
          notation: 'compact',
          maximumFractionDigits: 1
        });
        return formatter.format(value);
      }
    };
  }, [clientCurrency, selectedClientId]);
}

export { CURRENCY_CONFIG, type CurrencyCode, type CurrencyConfig };
