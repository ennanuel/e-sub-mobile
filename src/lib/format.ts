import { getCountryByCurrency } from '@/constants/country';
import { getStoreCurrency } from '@/constants/routes';
import { ProjectBundle } from '@/types';

import { defaultCountries, parseCountry } from 'react-international-phone';

/** Short naira: ₦8.4M, ₦10.4M, ₦500k. */
export const currencyShort = (amount: number, initialCurrency: string | null) => {
  const currency = initialCurrency ?? getStoreCurrency() ?? 'NGN';
  const locale = getCountryByCurrency(currency)?.locale ?? 'en-NG';
  return formatAmount(
    amount,
    {
      maximumFractionDigits: 2,
      currency: currency,
      style: 'currency',
      notation: 'compact',
      compactDisplay: 'short',
    } as const,
    locale,
  );
};

/** Full naira: ₦2,500,000. */
export const currencyFull = (amount: number, initialCurrency: string | null) => {
  const currency = initialCurrency ?? getStoreCurrency() ?? 'NGN';
  const locale = getCountryByCurrency(currency)?.locale ?? 'en-NG';
  return formatAmount(
    amount,
    {
      style: 'currency',
      currency: currency ?? undefined,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    } as const,
    locale,
  );
};

export const formatAmount = (str: string | number, options: Intl.NumberFormatOptions, locales = 'en-US'): string => {
  return str && typeof str == 'string'
    ? Number(str?.replace(/\,/g, '')).toLocaleString(locales, options)
    : Number(str?.toString()?.replace(/\,/g, '')).toLocaleString(locales, options);
};

export const formatListingAmount = (amount: string | number, currency?: string) => {
  if (!currency) return formatToCurrency(amount);
  else {
    const locale = `en-${currency?.substring(0, 2) || 'US'}`;
    return formatAmount(amount, { style: 'currency', currency }, locale);
  }
};

export const formatToCurrency = (amount: string | number, initialCurrency?: string, condition = 'no space', excludeCurrency?: boolean) => {
  if (typeof window === 'undefined') return;
  const currency = initialCurrency ?? getStoreCurrency();
  const locale = getCountryByCurrency(currency)?.locale ?? 'en-NG';

  try {
    const formattedAmount =
      amount && typeof amount === 'string' ? Number(amount.replace(/\,/g, '')) : Number(amount?.toString()?.replace(/\,/g, ''));

    let formattedString = formattedAmount.toLocaleString(locale, {
      style: 'currency',
      currency: JSON.parse(currency),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Add space if condition is not 'no space'
    if (condition !== 'no space') {
      formattedString = formattedString.replace(/(.)(.*)/, '$1 $2');
    }
    if (excludeCurrency) {
      // If excludeCurrency is true, remove currency symbol using regex
      formattedString = formattedString.substring(1).trim();
    }
    if (formattedString.includes('NaN')) {
      throw new Error('-');
    }
    return formattedString?.trim();
  } catch {
    return '-';
  }
};

/** "Nov 2027" */
export function monthYear(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

/** "22 November" */
export function dayMonth(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
}

/** "12 NOV 2026 · 07:15", for the view-only notice and watermark. */
export function viewStamp(date = new Date()): string {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} · ${hh}:${mm}`;
}

/** "0006162760" -> "0006 162 760" */
export function accountNumber(n: string): string {
  return n.replace(/^(\d{4})(\d{3})(\d+)$/, '$1 $2 $3');
}

/** Capitalise the first letter, trim the rest. */
export function capitalise(s: string): string {
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Nigerian phone as typed, shown after a fixed +234: "803 412 7790".
 * Drops a leading 0 or 234 if the person types them.
 */
export function formatLocalPhone(input: string): string {
  let d = input.replace(/\D/g, '');
  d = d.replace(/^0+/, '').slice(0, 10);
  return d.replace(/^(\d{3})(\d{0,3})(\d{0,4}).*/, (_, a: string, b: string, c: string) => [a, b, c].filter(Boolean).join(' '));
}

/** "803 412 7790" -> "+2348034127790" */
export function toE164(local: string): string {
  return local.replace(/\D/g, '')
}

export function formatUnitSize(unit: ProjectBundle | null) {
  if (!unit?.unit_size) return '';
  return `${unit?.unit_size}${!/[a-z]/i.test(unit.unit_size) ? ' sqm' : ''}`;
}

export const getCountryDetailsByName = (countryName: string) => {
  if (!countryName) return null;

  const normalizedSearch = countryName.trim().toLowerCase();

  const matchedCountry = defaultCountries.find((countryData) => {
    const { name } = parseCountry(countryData);
    return name.toLowerCase() === normalizedSearch;
  });

  if (!matchedCountry) {
    return null;
  }

  const parsed = parseCountry(matchedCountry);

  return {
    iso2: parsed.iso2, // e.g., "us" (for defaultCountry prop)
    dialCode: parsed.dialCode, // e.g., "1" (without the '+' prefix)
    name: parsed.name, // e.g., "United States"
  };
};
