import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type MeterId = string;
export type Meter = { id: MeterId; owner: string; label: string };
export type Tenant = { id: string; meterId: MeterId; name: string };
export type ReadingEntry = { previous: number; current: number; paid: number };
export type Payment = { id: string; tenantId: string; amount: number; paidAt: string; receipt: string; note: string };
export type Invoice = {
  id: string;
  meterId: MeterId;
  title: string;
  issueDate: string;
  issueKind: "بداية الشهر" | "منتصف الشهر" | "نهاية الشهر";
  rate: number;
  originalInvoice: number;
  main: ReadingEntry;
  tenants: Record<string, ReadingEntry>;
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
};

export const METERS: Meter[] = [
  { id: "meter-1", owner: "محمد محمد آل صالح", label: "العداد الرئيسي الأول" },
  { id: "meter-2", owner: "بشير الحبيشي", label: "العداد الرئيسي الثاني" },
];
export const TENANTS: Tenant[] = [
  { id: "ahmed", meterId: "meter-1", name: "أحمد الشريف" },
  { id: "mohammed", meterId: "meter-1", name: "محمد جياش" },
  { id: "hassan", meterId: "meter-2", name: "حسن الحجوري" },
  { id: "marwan", meterId: "meter-2", name: "مروان" },
  { id: "ibrahim", meterId: "meter-2", name: "إبراهيم الشبيبي" },
  { id: "moath", meterId: "meter-2", name: "معاذ المجيدي" },
  { id: "fawzi", meterId: "meter-2", name: "فوزي الشبيبي" },
];

const STORAGE_KEY = "electricity-ledger-v2-reset-20261116";
const SETTINGS_KEY = "electricity-ledger-settings-v1";

type SettingsRecord = { defaultRate?: number; meters?: Meter[]; tenants?: Tenant[] };
export type StoreContextValue = {
  invoices: Invoice[];
  meters: Meter[];
  tenants: Tenant[];
  hydrated: boolean;
  defaultRate: number;
  setDefaultRate: (rate: number) => Promise<void>;
  addMeter: (owner: string, tenantNames: string[]) => Promise<Meter>;
  createInvoice: (input: { meterId: MeterId; title: string; issueDate: string; issueKind: Invoice["issueKind"]; rate: number; originalInvoice: number }) => Promise<Invoice>;
  updateInvoice: (id: string, patch: Partial<Pick<Invoice, "title" | "issueDate" | "issueKind" | "rate" | "originalInvoice" | "main" | "tenants" | "payments">>) => Promise<void>;
  addPayment: (invoiceId: string, payment: Omit<Payment, "id">) => Promise<Payment>;
  deleteInvoice: (id: string) => Promise<void>;
  clearInvoices: () => Promise<void>;
  getInvoice: (id: string | undefined) => Invoice | undefined;
};
const StoreContext = createContext<StoreContextValue | null>(null);

function sortInvoices(items: Invoice[]) { return [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.issueDate.localeCompare(a.issueDate)); }
function normalizeInvoice(item: Invoice): Invoice {
  const legacyMeterId = String(item.meterId) === "1" ? "meter-1" : String(item.meterId) === "2" ? "meter-2" : String(item.meterId);
  return { ...item, meterId: legacyMeterId, payments: Array.isArray(item.payments) ? item.payments : [], main: item.main ?? { previous: 0, current: 0, paid: 0 }, tenants: item.tenants ?? {} };
}
function latestForMeter(items: Invoice[], meterId: MeterId) { return [...items].filter((item) => item.meterId === meterId).sort((a, b) => b.issueDate.localeCompare(a.issueDate) || b.updatedAt.localeCompare(a.updatedAt))[0]; }
function numberOrZero(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0; }

export function ElectricityProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [meters, setMeters] = useState<Meter[]>(METERS);
  const [tenants, setTenants] = useState<Tenant[]>(TENANTS);
  const [defaultRate, setDefaultRateState] = useState(261);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(SETTINGS_KEY)]).then(([raw, settingsRaw]) => {
      if (raw) { try { const parsed = JSON.parse(raw) as Invoice[]; if (Array.isArray(parsed)) setInvoices(sortInvoices(parsed.map(normalizeInvoice))); } catch { setInvoices([]); } }
      if (settingsRaw) { try { const parsed = JSON.parse(settingsRaw) as SettingsRecord; if (typeof parsed.defaultRate === "number" && parsed.defaultRate >= 0) setDefaultRateState(parsed.defaultRate); if (Array.isArray(parsed.meters) && parsed.meters.length) setMeters(parsed.meters); if (Array.isArray(parsed.tenants)) setTenants(parsed.tenants); } catch { setDefaultRateState(261); } }
    }).finally(() => setHydrated(true));
  }, []);

  const persistSettings = useCallback(async (next: SettingsRecord) => { await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); }, []);
  const setDefaultRate = useCallback(async (rate: number) => { const safeRate = Number.isFinite(rate) && rate >= 0 ? rate : 261; setDefaultRateState(safeRate); await persistSettings({ defaultRate: safeRate, meters, tenants }); }, [meters, tenants, persistSettings]);
  const addMeter = useCallback(async (owner: string, tenantNames: string[]) => {
    const cleanOwner = owner.trim();
    const meter: Meter = { id: `meter-${Date.now()}`, owner: cleanOwner, label: `العداد الرئيسي رقم ${meters.length + 1}` };
    const newTenants = tenantNames.filter((name) => name.trim()).map((name, index) => ({ id: `${meter.id}-tenant-${index + 1}`, meterId: meter.id, name: name.trim() }));
    const nextMeters = [...meters, meter]; const nextTenants = [...tenants, ...newTenants];
    setMeters(nextMeters); setTenants(nextTenants); await persistSettings({ defaultRate, meters: nextMeters, tenants: nextTenants }); return meter;
  }, [defaultRate, meters, tenants, persistSettings]);
  const persist = useCallback(async (next: Invoice[]) => { const sorted = sortInvoices(next); setInvoices(sorted); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sorted)); }, []);
  const createInvoice = useCallback<StoreContextValue["createInvoice"]>(async (input) => {
    const previous = latestForMeter(invoices, input.meterId);
    const invoiceTenants = tenants.filter((tenant) => tenant.meterId === input.meterId).reduce<Record<string, ReadingEntry>>((acc, tenant) => { const old = previous?.tenants[tenant.id]; acc[tenant.id] = { previous: old?.current ?? 0, current: 0, paid: 0 }; return acc; }, {});
    const now = new Date().toISOString(); const invoice: Invoice = { id: `${input.meterId}-${Date.now()}`, meterId: input.meterId, title: input.title.trim(), issueDate: input.issueDate, issueKind: input.issueKind, rate: numberOrZero(input.rate), originalInvoice: numberOrZero(input.originalInvoice), main: { previous: previous?.main.current ?? 0, current: 0, paid: 0 }, tenants: invoiceTenants, payments: [], createdAt: now, updatedAt: now };
    await persist([invoice, ...invoices]); return invoice;
  }, [invoices, persist, tenants]);
  const updateInvoice = useCallback<StoreContextValue["updateInvoice"]>(async (id, patch) => { await persist(invoices.map((invoice) => invoice.id === id ? { ...invoice, ...patch, updatedAt: new Date().toISOString() } : invoice)); }, [invoices, persist]);
  const addPayment = useCallback<StoreContextValue["addPayment"]>(async (invoiceId, input) => { const payment: Payment = { ...input, id: `payment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }; await persist(invoices.map((invoice) => invoice.id === invoiceId ? { ...invoice, payments: [...(invoice.payments ?? []), payment], updatedAt: new Date().toISOString() } : invoice)); return payment; }, [invoices, persist]);
  const deleteInvoice = useCallback(async (id: string) => { await persist(invoices.filter((invoice) => invoice.id !== id)); }, [invoices, persist]);
  const clearInvoices = useCallback(async () => { await persist([]); }, [persist]);
  const getInvoice = useCallback((id: string | undefined) => invoices.find((invoice) => invoice.id === id), [invoices]);
  const value = useMemo(() => ({ invoices, meters, tenants, hydrated, defaultRate, setDefaultRate, addMeter, createInvoice, updateInvoice, addPayment, deleteInvoice, clearInvoices, getInvoice }), [invoices, meters, tenants, hydrated, defaultRate, setDefaultRate, addMeter, createInvoice, updateInvoice, addPayment, deleteInvoice, clearInvoices, getInvoice]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useElectricity() { const context = useContext(StoreContext); if (!context) throw new Error("useElectricity must be used inside ElectricityProvider"); return context; }
export function getMeter(meterId: MeterId, catalog: Meter[] = METERS) { return catalog.find((meter) => meter.id === meterId) ?? catalog[0] ?? METERS[0]; }
export function getTenants(meterId: MeterId, catalog: Tenant[] = TENANTS) { return catalog.filter((tenant) => tenant.meterId === meterId); }
export function paymentTotal(invoice: Invoice, tenantId: string) { return (invoice.payments ?? []).filter((payment) => payment.tenantId === tenantId).reduce((sum, payment) => sum + payment.amount, 0); }
export function invoiceTotals(invoice: Invoice, catalog: Tenant[] = TENANTS) {
  const mainConsumption = invoice.main.current - invoice.main.previous;
  const tenantRows = getTenants(invoice.meterId, catalog).map((tenant) => { const entry = invoice.tenants[tenant.id] ?? { previous: 0, current: 0, paid: 0 }; const consumption = entry.current - entry.previous; const amount = consumption * invoice.rate; const recordedPayments = (invoice.payments ?? []).filter((payment) => payment.tenantId === tenant.id); const paid = recordedPayments.length ? recordedPayments.reduce((sum, payment) => sum + payment.amount, 0) : entry.paid; const remaining = Math.max(amount - paid, 0); return { tenant, entry, consumption, amount, paid, remaining }; });
  const due = tenantRows.reduce((sum, row) => sum + Math.max(row.amount, 0), 0); const paid = tenantRows.reduce((sum, row) => sum + row.paid, 0); const tenantConsumption = tenantRows.reduce((sum, row) => sum + Math.max(row.consumption, 0), 0);
  return { mainConsumption, tenantRows, due, paid, remaining: Math.max(due - paid, 0), tenantConsumption, mismatch: mainConsumption - tenantConsumption };
}
export function formatNumber(value: number) { return new Intl.NumberFormat("ar-YE", { maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0); }
export function formatMoney(value: number) { return `${formatNumber(value)} ريال`; }
