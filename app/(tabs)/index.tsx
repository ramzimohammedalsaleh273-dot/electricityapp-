import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ActionCard, BrandHeader, SectionHeading, StatCard, cardStyle } from "@/components/electricity-ui";
import { E } from "@/constants/electricity-theme";
import { formatMoney, invoiceTotals, useElectricity } from "@/lib/electricity-store";
import { ScreenContainer } from "@/components/screen-container";
import { DateBanner } from "@/components/date-banner";

export default function HomeScreen() {
  const router = useRouter();
  const { invoices, hydrated, meters, tenants } = useElectricity();
  const due = invoices.reduce((sum, invoice) => sum + invoiceTotals(invoice, tenants).due, 0);
  const paid = invoices.reduce((sum, invoice) => sum + invoiceTotals(invoice, tenants).paid, 0);
  const remaining = Math.max(due - paid, 0);

  if (!hydrated) return <ScreenContainer><View style={styles.loading}><Ionicons name="flash" size={38} color={E.gold} /><Text style={styles.loadingText}>جاري تجهيز الدفتر...</Text></View></ScreenContainer>;

  return <ScreenContainer safeAreaClassName="bg-[#F7F3EA]" edges={["top"]}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <DateBanner />
      <View style={styles.hero}>
        <BrandHeader title="دفتر فواتير الكهرباء" subtitle="إدارة مرتبة لكل عداد وكل شهر" />
        <View style={styles.heroRule} />
        <Text style={styles.heroHint}>سجّل القراءة الحالية فقط، ودع التطبيق يكمل الحساب.</Text>
      </View>

      <SectionHeading title="ملخص الدفتر" subtitle={`${invoices.length} فاتورة محفوظة محلياً`} />
      <View style={styles.statsRow}>
        <StatCard label="الفواتير" value={String(invoices.length)} icon="receipt-outline" tone="navy" />
        <StatCard label="المحصّل" value={formatMoney(paid)} icon="cash-outline" tone="green" />
        <StatCard label="المتبقي" value={formatMoney(remaining)} icon="alert-circle-outline" tone="red" />
      </View>

      <SectionHeading title="ماذا تريد أن تفعل؟" subtitle="اختر العملية المطلوبة" />
      <ActionCard title="إنشاء فاتورة جديدة" subtitle="اختر العداد وأصدر فاتورة مستقلة" icon="add-circle" tone="gold" onPress={() => router.push("/invoice/new")} />
      <ActionCard title="العمليات المحفوظة" subtitle="راجع الفواتير وعدّلها دون حذف القديم" icon="archive" onPress={() => router.push("/(tabs)/saved")} />
      <ActionCard title="عمليات المستأجرين" subtitle="كل القراءات والمدفوعات في سجل واحد" icon="people" onPress={() => router.push("/(tabs)/tenants")} />

      <SectionHeading title="العدادان الرئيسيان" subtitle="فاتورة مستقلة لكل عداد" />
      {meters.map((meter) => {
        const count = invoices.filter((invoice) => invoice.meterId === meter.id).length;
        return <View key={meter.id} style={[cardStyle, styles.meterCard]}>
          <View style={styles.meterIcon}><Ionicons name="speedometer-outline" size={25} color={E.gold} /></View>
          <View style={styles.meterText}><Text style={styles.meterLabel}>{meter.label}</Text><Text style={styles.meterOwner}>{meter.owner}</Text><Text style={styles.meterCount}>{count} فاتورة محفوظة</Text></View>
        </View>;
      })}
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: E.cream, gap: 10 },
  loadingText: { color: E.navy, fontSize: 16, fontWeight: "700" },
  hero: { backgroundColor: E.navy, borderRadius: 25, padding: 20, marginBottom: 22 },
  heroRule: { height: 1, backgroundColor: "#557086", marginVertical: 16 },
  heroHint: { color: "#D6E3EC", fontSize: 13, textAlign: "right", lineHeight: 22 },
  statsRow: { flexDirection: "row-reverse", gap: 8, marginBottom: 18 },
  meterCard: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  meterIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: E.navy, alignItems: "center", justifyContent: "center" },
  meterText: { flex: 1, alignItems: "flex-end" },
  meterLabel: { color: E.gold, fontSize: 12, fontWeight: "800", textAlign: "right" },
  meterOwner: { color: E.navy, fontSize: 16, fontWeight: "800", textAlign: "right", marginTop: 3 },
  meterCount: { color: E.muted, fontSize: 12, marginTop: 4, textAlign: "right" },
});
