import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { BrandHeader, SectionHeading } from "@/components/electricity-ui";
import { E } from "@/constants/electricity-theme";
import { inputNumber } from "@/lib/electricity-format";
import { useElectricity } from "@/lib/electricity-store";
import { ScreenContainer } from "@/components/screen-container";

export default function SettingsScreen() {
  const { defaultRate, setDefaultRate } = useElectricity();
  const [draft, setDraft] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const value = draft ?? String(defaultRate);
  async function save() {
    await setDefaultRate(inputNumber(value));
    setDraft(null);
    setSaved(true);
  }
  return <ScreenContainer safeAreaClassName="bg-[#F7F3EA]" edges={["top"]}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><BrandHeader title="الإعدادات" subtitle="ثوابت دفتر الكهرباء" icon="settings" /></View><SectionHeading title="السعر الافتراضي" subtitle="يُستخدم تلقائياً عند إنشاء أي فاتورة جديدة" /><View style={styles.card}><View style={styles.icon}><Ionicons name="flash" size={25} color={E.gold} /></View><Text style={styles.label}>سعر الكيلوواط بالريال اليمني</Text><TextInput value={value} onChangeText={(text) => { setDraft(text); setSaved(false); }} keyboardType="decimal-pad" textAlign="right" style={styles.input} /><View style={styles.note}><Ionicons name="information-circle-outline" size={19} color={E.gold} /><Text style={styles.noteText}>تغيير هذا السعر يؤثر على الفواتير الجديدة فقط. الفواتير القديمة تبقى بسعرها المحفوظ حتى لا تتغير سجلات الأشهر السابقة.</Text></View><Pressable onPress={save} style={({ pressed }) => [styles.save, pressed && { opacity: 0.8 }]}><Ionicons name="save-outline" size={20} color={E.navy} /><Text style={styles.saveText}>حفظ السعر الافتراضي</Text></Pressable>{saved ? <Text style={styles.success}>تم حفظ السعر، وستظهر قيمته تلقائياً عند إنشاء الفاتورة القادمة.</Text> : null}</View><SectionHeading title="البيانات الثابتة" subtitle="موجودة مسبقاً داخل التطبيق" /><View style={styles.infoCard}><Text style={styles.infoTitle}>العدادان الرئيسيان</Text><Text style={styles.infoText}>محمد محمد آل صالح — أحمد الشريف، محمد جياش</Text><Text style={styles.infoText}>بشير الحبيشي — حسن الحجوري، مروان، إبراهيم الشبيبي، معاذ المجيدي، فوزي الشبيبي</Text></View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 16, paddingBottom: 40 }, header: { backgroundColor: E.navy, borderRadius: 24, padding: 19, marginBottom: 22 }, card: { backgroundColor: E.paper, borderWidth: 1, borderColor: E.line, borderRadius: 22, padding: 17 }, icon: { width: 52, height: 52, borderRadius: 17, backgroundColor: E.navy, alignItems: "center", justifyContent: "center", alignSelf: "flex-end", marginBottom: 12 }, label: { color: E.navy, fontSize: 13, fontWeight: "800", textAlign: "right", marginBottom: 7 }, input: { minHeight: 52, borderWidth: 1.5, borderColor: E.gold, borderRadius: 13, backgroundColor: "#FFF9EB", color: E.navy, fontSize: 22, fontWeight: "900", paddingHorizontal: 14 }, note: { flexDirection: "row-reverse", gap: 8, backgroundColor: E.goldSoft, borderRadius: 12, padding: 11, marginTop: 14 }, noteText: { flex: 1, color: E.navy, fontSize: 12, lineHeight: 19, textAlign: "right" }, save: { flexDirection: "row-reverse", gap: 8, alignItems: "center", justifyContent: "center", backgroundColor: E.gold, borderRadius: 13, paddingVertical: 14, marginTop: 16 }, saveText: { color: E.navy, fontSize: 14, fontWeight: "900" }, success: { color: E.green, backgroundColor: E.greenSoft, padding: 11, borderRadius: 10, marginTop: 12, textAlign: "right", fontSize: 12, lineHeight: 19 }, infoCard: { backgroundColor: E.paper, borderWidth: 1, borderColor: E.line, borderRadius: 18, padding: 16, gap: 10 }, infoTitle: { color: E.gold, fontSize: 14, fontWeight: "900", textAlign: "right" }, infoText: { color: E.navy, fontSize: 12, lineHeight: 20, textAlign: "right" },
});
