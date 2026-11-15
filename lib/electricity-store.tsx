import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type MeterId = 1 | 2;

export type Meter = {
  id: MeterId;
  owner: string;
  label: string;
};

export type Tenant = {
  id: string;
  meterId: MeterId;
  name: string;
};

export type ReadingEntry = {
  previous: number;
  current: number;
  paid: number;
};

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
  createdAt: string;
  updatedAt: string;
};

export const METERS: Meter[] = [
  { id: 1, owner: "محمد محمد آل صالح", label: "العداد الرئيسي الأول" },
  { id: 2, owner: "بشير الحبيشي", label: "العداد الرئيسي الثاني" },
];

export const TENANTS: Tenant[] = [
  { id: "ahmed", meterId: 1, name: "أحمد الشريف" },
  { id: "mohammed", meterId: 1, name: "محمد جياش" },
  { id: "hassan", meterId: 2, name: "حسن الحجوري" },
  { id: "marwan", meterId: 2, name: "مروان" },
  { id: "ibrahim", meterId: 2, name: "إبراهيم الشبيبي" },
  { id: "moath", meterId: 2, name: "معاذ المجيدي" },
  { id: "fawzi", meterId: 2, name: "فوزي الشبيبي" },
];

const STORAGE_KEY = "electricity-ledger-v1";
const SETTINGS_KEY = "electricity-ledger-settings-v1";

export type StoreContextValue = {
  invoices: Invoice[];
  hydrated: boolean;
  defaultRate: number;
  setDefaultRate: (rate: number) => Promise<void>;
  createInvoice: (input: {
    meterId: MeterId;
    title: string;
    issueDate: string;
    issueKind: Invoice["issueKind"];
    rate: number;
    originalInvoice: number;
  }) => Promise<Invoice>;
  updateInvoice: (id: string, patch: Partial<Pick<Invoice, "title" | "issueDate" | "issueKind" | "rate" | "originalInvoice" | "main" | "tenants">>) => Promise<void>;
  getInvoice: (id: string | undefined) => Invoice | undefined;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function sortInvoices(items: Invoice[]) {
  return [...items].sort((a, b) => {
    const saved = b.updatedAt.localeCompare(a.updatedAt);
    return saved || b.issueDate.localeCompare(a.issueDate);
  });
}

function latestForMeter(items: Invoice[], meterId: MeterId) {
  return [...items]
    .filter((item) => item.meterId === meterId)
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate) || b.updatedAt.localeCompare(a.updatedAt))[0];
}

function numberOrZero(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function ElectricityProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [defaultRate, setDefaultRateState] = useState(261);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(SETTINGS_KEY)])
      .then(([raw, settingsRaw]) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Invoice[];
            if (Array.isArray(parsed)) setInvoices(sortInvoices(parsed));
          } catch {
            setInvoices([]);
          }
        }
        if (settingsRaw) {
          try {
            const parsed = JSON.parse(settingsRaw) as { defaultRate?: number };
            if (typeof parsed.defaultRate === "number" && parsed.defaultRate >= 0) setDefaultRateState(parsed.defaultRate);
          } catch {
            setDefaultRateState(261);
          }
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  const setDefaultRate = useCallback(async (rate: number) => {
    const safeRate = Number.isFinite(rate) && rate >= 0 ? rate : 261;
    setDefaultRateState(safeRate);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ defaultRate: safeRate }));
  }, []);

  const persist = useCallback(async (next: Invoice[]) => {
    const sorted = sortInvoices(next);
    setInvoices(sorted);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  }, []);

  const createInvoice = useCallback<StoreContextValue["createInvoice"]>(async (input) => {
    const previous = latestForMeter(invoices, input.meterId);
    const previousTenants = TENANTS.filter((tenant) => tenant.meterId === input.meterId);
    const tenants = previousTenants.reduce<Record<string, ReadingEntry>>((acc, tenant) => {
      const old = previous?.tenants[tenant.id];
      acc[tenant.id] = { previous: old?.current ?? 0, current: 0, paid: 0 };
      return acc;
    }, {});
    const invoice: Invoice = {
      id: `${input.meterId}-${Date.now()}`,
      meterId: input.meterId,
      title: input.title.trim(),
      issueDate: input.issueDate,
      issueKind: input.issueKind,
      rate: numberOrZero(input.rate),
      originalInvoice: numberOrZero(input.originalInvoice),
      main: { previous: previous?.main.current ?? 0, current: 0, paid: 0 },
      tenants,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await persist([invoice, ...invoices]);
    return invoice;
  }, [invoices, persist]);

  const updateInvoice = useCallback<StoreContextValue["updateInvoice"]>(async (id, patch) => {
    const next = invoices.map((invoice) => invoice.id === id
      ? { ...invoice, ...patch, updatedAt: new Date().toISOString() }
      : invoice);
    await persist(next);
  }, [invoices, persist]);

  const getInvoice = useCallback((id: string | undefined) => invoices.find((invoice) => invoice.id === id), [invoices]);

  const value = useMemo(() => ({ invoices, hydrated, defaultRate, setDefaultRate, createInvoice, updateInvoice, getInvoice }), [invoices, hydrated, defaultRate, setDefaultRate, createInvoice, updateInvoice, getInvoice]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useElectricity() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useElectricity must be used inside ElectricityProvider");
  return context;
}

export function getMeter(meterId: MeterId) {
  return METERS.find((meter) => meter.id === meterId) ?? METERS[0];
}

export function getTenants(meterId: MeterId) {
  return TENANTS.filter((tenant) => tenant.meterId === meterId);
}

export function invoiceTotals(invoice: Invoice) {
  const mainConsumption = invoice.main.current - invoice.main.previous;
  const tenantRows = getTenants(invoice.meterId).map((tenant) => {
    const entry = invoice.tenants[tenant.id] ?? { previous: 0, current: 0, paid: 0 };
    const consumption = entry.current - entry.previous;
    const amount = consumption * invoice.rate;
    const remaining = Math.max(amount - entry.paid, 0);
    return { tenant, entry, consumption, amount, remaining };
  });
  const due = tenantRows.reduce((sum, row) => sum + Math.max(row.amount, 0), 0);
  const paid = tenantRows.reduce((sum, row) => sum + row.entry.paid, 0);
  const tenantConsumption = tenantRows.reduce((sum, row) => sum + Math.max(row.consumption, 0), 0);
  return {
    mainConsumption,
    tenantRows,
    due,
    paid,
    remaining: Math.max(due - paid, 0),
    tenantConsumption,
    mismatch: mainConsumption - tenantConsumption,
  };
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("ar-YE", { maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
}

export function formatMoney(value: number) {
  return `${formatNumber(value)} ريال`;
}
