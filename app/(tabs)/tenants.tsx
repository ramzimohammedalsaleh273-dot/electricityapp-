import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";

import { BrandHeader, Pill, SectionHeading, cardStyle } from "@/components/electricity-ui";
import { E } from "@/constants/electricity-theme";
import { invoiceDateLabel } from "@/lib/electricity-format";
import { formatMoney, getMeter, invoiceTotals, type MeterId, useElectricity } from "@/lib/electricity-store";
import { ScreenContainer } from "@/components/screen-container";

export default function TenantsScreen() {
  const router = useRouter(); const { invoices } = useElectricity(); const [filter, setFilter] = useState<MeterId | "all">("all");
  const rows = useMemo(() => invoices.flatMap((invoice) => { const totals = invoiceTotals(invoice); return totals.tenantRows.filter((item) => filter === "all" || invoice.meterId === filter).map((item) => ({ ...item, invoice })); }).sort((a,b) => b.invoice.updatedAt.localeCompare(a.invoice.updatedAt)), [invoices, filter]);
  return <ScreenContainer safeAreaClassName="bg-[#F7F3EA]" edges={["top"]}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><BrandHeader title="عمليات المستأجرين" subtitle="قراءات ومدفوعات قابلة للمراجعة" icon="people" /></View>
      <SectionHeading title="تصفية حسب العداد" subtitle="اختر العداد لعرض مستأجريه" />
      <View style={styles.filters}><Pressable style={[styles.filter, filter === "all" && styles.filterActive]} onPress={() => setFilter("all")}><Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>الكل</Text></Pressable>{([1,2] as MeterId[]).map((id) => <Pressable key={id} style={[styles.filter, filter === id && styles.filterActive]} onPress={() => setFilter(id)}><Text style={[styles.filterText, filter === id && styles.filterTextActive]}>{getMeter(id).owner}</Text></Pressable>)}</View>
      {rows.length === 0 ? <View style={styles.empty}><Ionicons name="people-outline" size={40} color={E.gold} /><Text style={styles.emptyText}>لا توجد عمليات مستأجرين محفوظة.</Text></View> : rows.map(({ invoice, tenant, entry, consumption, amount, remaining }) => { const status = amount > 0 && entry.paid >= amount ? "مدفوع بالكامل" : entry.paid > 0 ? "جزئي" : "لم يدفع"; const tone = status === "مدفوع بالكامل" ? "green" : status === "جزئي" ? "orange" : "red"; return <Pressable key={`${invoice.id}-${tenant.id}`} style={({ pressed }) => [cardStyle, pressed && { opacity: 0.82 }]} onPress={() => router.push(`/invoice/${invoice.id}`)}><View style={styles.rowTop}><Pill label={status} tone={tone as "green" | "orange" | "red"} /><View style={styles.identity}><Text style={styles.name}>{tenant.name}</Text><Text style={styles.meta}>{invoice.title} • {invoiceDateLabel(invoice.issueDate)}</Text><Text style={styles.meta}>{getMeter(invoice.meterId).owner}</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>{tenant.name.slice(0,1)}</Text></View></View><View style={styles.numbers}><View><Text style={styles.numLabel}>الاستهلاك</Text><Text style={styles.num}>{consumption.toLocaleString("ar-YE")} ك.و</Text></View><View><Text style={styles.numLabel}>القيمة</Text><Text style={styles.num}>{formatMoney(amount)}</Text></View><View><Text style={styles.numLabel}>المتبقي</Text><Text style={[styles.num, { color: E.red }]}>{formatMoney(remaining)}</Text></View></View><Text style={styles.editHint}>فتح الفاتورة للتعديل ←</Text></Pressable>; })}
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 16, paddingBottom: 40 }, header: { backgroundColor: E.navy, borderRadius: 24, padding: 19, marginBottom: 22 }, filters: { flexDirection: "row-reverse", gap: 8, flexWrap: "wrap", marginBottom: 15 }, filter: { borderWidth: 1, borderColor: E.line, backgroundColor: E.paper, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 }, filterActive: { backgroundColor: E.navy, borderColor: E.navy }, filterText: { color: E.muted, fontSize: 12, fontWeight: "700" }, filterTextActive: { color: E.white }, rowTop: { flexDirection: "row-reverse", alignItems: "center", gap: 9 }, identity: { flex: 1, alignItems: "flex-end" }, name: { color: E.navy, fontSize: 16, fontWeight: "800", textAlign: "right" }, meta: { color: E.muted, fontSize: 11, textAlign: "right", marginTop: 3 }, avatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: E.goldSoft, alignItems: "center", justifyContent: "center" }, avatarText: { color: E.gold, fontSize: 19, fontWeight: "800" }, numbers: { flexDirection: "row-reverse", justifyContent: "space-between", marginTop: 16, paddingTop: 13, borderTopWidth: 1, borderTopColor: E.line }, numLabel: { color: E.muted, fontSize: 10, textAlign: "right" }, num: { color: E.navy, fontSize: 12, fontWeight: "800", textAlign: "right", marginTop: 3 }, editHint: { color: E.gold, fontSize: 11, fontWeight: "700", textAlign: "right", marginTop: 13 }, empty: { alignItems: "center", gap: 10, paddingTop: 50 }, emptyText: { color: E.muted, fontSize: 14 },
});
