import { Invoice, invoiceTotals } from "@/lib/electricity-store";

export function invoiceDateLabel(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-YE", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function invoiceStatus(invoice: Invoice) {
  const { due, paid } = invoiceTotals(invoice);
  if (due > 0 && paid >= due) return { label: "مدفوعة بالكامل", tone: "green" as const };
  if (paid > 0) return { label: "مدفوعة جزئياً", tone: "orange" as const };
  return { label: "غير مدفوعة", tone: "red" as const };
}

export function inputNumber(value: string) {
  const normalized = value.replace(/[^0-9.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
