import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BrandHeader, SectionHeading, StatCard, Pill, cardStyle } from "@/components/electricity-ui";
import { E } from "@/constants/electricity-theme";
import { invoiceDateLabel } from "@/lib/electricity-format";
import { formatMoney, getMeter, invoiceTotals, useElectricity } from "@/lib/electricity-store";
import { ScreenContainer } from "@/components/screen-container";

export default function SavedScreen() {
  const router = useRouter();
  const { invoices, hydrated, meters, tenants, deleteInvoice, clearInvoices } = useElectricity();
  return <ScreenContainer safeAreaClassName="bg-[#F7F3EA]" edges={["top"]}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><BrandHeader title="العمليات المحفوظة" subtitle="مرتبة حسب آخر عملية حفظ" icon="archive" />{invoices.length > 0 ? <Pressable onPress={() => clearInvoices()} style={styles.clearButton}><Ionicons name="trash-outline" size={17} color={E.red} /><Text style={styles.clearText}>حذف جميع الفواتير</Text></Pressable> : null}</View>
      {!hydrated ? <Text style={styles.empty}>جاري تحميل العمليات...</Text> : invoices.length === 0 ? <View style={styles.emptyCard}><Ionicons name="documents-outline" size={42} color={E.gold} /><Text style={styles.emptyTitle}>لا توجد فواتير بعد</Text><Text style={styles.emptyText}>أنشئ أول فاتورة، وستبقى محفوظة داخل الهاتف.</Text><Pressable style={styles.primaryButton} onPress={() => router.push("/invoice/new")}><Text style={styles.primaryText}>إنشاء أول فاتورة</Text></Pressable></View> : <>
        <SectionHeading title={`${invoices.length} فاتورة`} subtitle="يمكن فتح أي فاتورة ومراجعتها وتعديلها" />
        {invoices.map((invoice) => {
          const meter = getMeter(invoice.meterId, meters); const totals = invoiceTotals(invoice, tenants); const status = totals.due > 0 && totals.paid >= totals.due ? "مدفوعة بالكامل" : totals.paid > 0 ? "جزئية" : "لم تدفع"; const tone = status === "مدفوعة بالكامل" ? "green" : status === "جزئية" ? "orange" : "red";
          return <Pressable key={invoice.id} style={({ pressed }) => [cardStyle, pressed && { opacity: 0.82 }]} onPress={() => router.push(`/invoice/${invoice.id}`)}>
            <View style={styles.cardTop}><Pill label={status} tone={tone as "green" | "orange" | "red"} /><View style={styles.invoiceIdentity}><Text style={styles.invoiceTitle}>فاتورة رقم {invoice.invoiceNumber || "—"}</Text><Text style={styles.invoiceMeta}>{meter.owner} • السنة {invoice.year}</Text><Text style={styles.invoiceMeta}>من {invoiceDateLabel(invoice.startDate)} إلى {invoiceDateLabel(invoice.endDate)}</Text></View><View style={styles.receiptIcon}><Ionicons name="receipt-outline" size={21} color={E.gold} /></View></View>
            <View style={styles.cardRule} />
            <View style={styles.cardStats}><StatCard label="المستحق" value={formatMoney(totals.due)} tone="navy" /><StatCard label="المدفوع" value={formatMoney(totals.paid)} tone="green" /><StatCard label="المتبقي" value={formatMoney(totals.remaining)} tone="red" /></View>
            <View style={styles.actionRow}><Pressable onPress={() => router.push(`/invoice/${invoice.id}`)} style={styles.editButton}><Ionicons name="create-outline" size={17} color={E.navy} /><Text style={styles.editText}>تعديل</Text></Pressable><Pressable onPress={() => deleteInvoice(invoice.id)} style={styles.deleteButton}><Ionicons name="trash-outline" size={17} color={E.red} /><Text style={styles.deleteText}>حذف</Text></Pressable></View>
          </Pressable>;
        })}
      </>}
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 }, header: { backgroundColor: E.navy, borderRadius: 24, padding: 19, marginBottom: 22 }, clearButton: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: E.redSoft, borderRadius: 10, paddingVertical: 9, marginTop: 14 }, clearText: { color: E.red, fontSize: 12, fontWeight: "800" },
  empty: { textAlign: "right", color: E.muted, paddingTop: 30 }, emptyCard: { ...cardStyle, alignItems: "center", gap: 9, paddingVertical: 30 }, emptyTitle: { color: E.navy, fontSize: 18, fontWeight: "800" }, emptyText: { color: E.muted, fontSize: 13, textAlign: "center", lineHeight: 21 }, primaryButton: { backgroundColor: E.navy, borderRadius: 12, paddingHorizontal: 22, paddingVertical: 12, marginTop: 10 }, primaryText: { color: E.white, fontWeight: "800" }, cardTop: { flexDirection: "row-reverse", alignItems: "center", gap: 9 }, invoiceIdentity: { flex: 1, alignItems: "flex-end" }, invoiceTitle: { color: E.navy, fontSize: 16, fontWeight: "800", textAlign: "right" }, invoiceMeta: { color: E.muted, fontSize: 11, marginTop: 4, textAlign: "right" }, receiptIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: E.goldSoft, alignItems: "center", justifyContent: "center" }, cardRule: { height: 1, backgroundColor: E.line, marginVertical: 13 }, cardStats: { flexDirection: "row-reverse", gap: 7 }, actionRow: { flexDirection: "row-reverse", gap: 8, marginTop: 13 }, editButton: { flex: 1, flexDirection: "row-reverse", justifyContent: "center", alignItems: "center", gap: 5, backgroundColor: E.goldSoft, borderRadius: 10, paddingVertical: 10 }, editText: { color: E.navy, fontWeight: "800" }, deleteButton: { flex: 1, flexDirection: "row-reverse", justifyContent: "center", alignItems: "center", gap: 5, backgroundColor: E.redSoft, borderRadius: 10, paddingVertical: 10 }, deleteText: { color: E.red, fontWeight: "800" },
});
