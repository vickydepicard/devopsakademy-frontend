import { getLocale } from "../i18n";

export const formatMoney = (amount, currency = "XAF") => {
  try {
    return new Intl.NumberFormat(getLocale(), { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(amount) || 0);
  } catch {
    return `${Number(amount) || 0} ${currency}`;
  }
};

export const formatNumber = (n) => new Intl.NumberFormat(getLocale()).format(Number(n) || 0);

export const formatDate = (value, opts = { dateStyle: "medium" }) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : new Intl.DateTimeFormat(getLocale(), opts).format(d);
};

export const formatDateTime = (value) => formatDate(value, { dateStyle: "medium", timeStyle: "short" });
