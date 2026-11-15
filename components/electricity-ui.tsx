import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { E, shadows } from "@/constants/electricity-theme";

export function BrandHeader({ title, subtitle, icon = "flash" }: { title: string; subtitle?: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.brandHeader}>
      <View style={styles.brandIcon}><Ionicons name={icon} size={24} color={E.gold} /></View>
      <View style={styles.brandText}>
        <Text style={styles.brandTitle}>{title}</Text>
        {subtitle ? <Text style={styles.brandSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.heading}><Text style={styles.headingTitle}>{title}</Text>{subtitle ? <Text style={styles.headingSubtitle}>{subtitle}</Text> : null}</View>;
}

export function StatCard({ label, value, tone = "navy", icon }: { label: string; value: string; tone?: "navy" | "gold" | "green" | "red"; icon?: keyof typeof Ionicons.glyphMap }) {
  const color = tone === "gold" ? E.gold : tone === "green" ? E.green : tone === "red" ? E.red : E.navy;
  return <View style={[styles.statCard, { borderTopColor: color }]}>
    {icon ? <Ionicons name={icon} size={18} color={color} /> : null}
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>;
}

export function ActionCard({ title, subtitle, icon, onPress, tone = "navy" }: { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; tone?: "navy" | "gold" }) {
  const accent = tone === "gold" ? E.gold : E.navy;
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
    <View style={[styles.actionIcon, { backgroundColor: tone === "gold" ? E.goldSoft : "#E7EEF4" }]}><Ionicons name={icon} size={25} color={accent} /></View>
    <View style={styles.actionText}><Text style={styles.actionTitle}>{title}</Text><Text style={styles.actionSubtitle}>{subtitle}</Text></View>
    <Ionicons name="chevron-back" size={20} color={E.muted} />
  </Pressable>;
}

export function Pill({ label, tone = "muted" }: { label: string; tone?: "green" | "orange" | "red" | "muted" }) {
  const palette = tone === "green" ? { bg: E.greenSoft, fg: E.green } : tone === "orange" ? { bg: E.orangeSoft, fg: E.orange } : tone === "red" ? { bg: E.redSoft, fg: E.red } : { bg: "#EEF1F4", fg: E.muted };
  return <View style={[styles.pill, { backgroundColor: palette.bg }]}><Text style={[styles.pillText, { color: palette.fg }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  brandHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  brandIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: E.navySoft, alignItems: "center", justifyContent: "center" },
  brandText: { flex: 1, alignItems: "flex-end" },
  brandTitle: { color: E.white, fontSize: 20, fontWeight: "800", textAlign: "right" },
  brandSubtitle: { color: "#BFD0DE", fontSize: 12, marginTop: 2, textAlign: "right" },
  heading: { alignItems: "flex-end", marginBottom: 10 },
  headingTitle: { color: E.navy, fontSize: 18, fontWeight: "800", textAlign: "right" },
  headingSubtitle: { color: E.muted, fontSize: 12, marginTop: 4, textAlign: "right" },
  card: { backgroundColor: E.paper, borderWidth: 1, borderColor: E.line, borderRadius: 20, padding: 16, marginBottom: 14 },
  statCard: { flex: 1, minHeight: 90, borderTopWidth: 3, backgroundColor: E.paper, borderWidth: 1, borderColor: E.line, borderRadius: 16, padding: 11, gap: 4 },
  statLabel: { color: E.muted, fontSize: 11, textAlign: "right" },
  statValue: { fontSize: 15, fontWeight: "800", textAlign: "right" },
  actionCard: { flexDirection: "row-reverse", alignItems: "center", backgroundColor: E.paper, borderWidth: 1, borderColor: E.line, borderRadius: 20, padding: 14, gap: 12, marginBottom: 11, ...shadows.card },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  actionIcon: { width: 50, height: 50, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  actionText: { flex: 1, alignItems: "flex-end" },
  actionTitle: { color: E.navy, fontSize: 16, fontWeight: "800", textAlign: "right" },
  actionSubtitle: { color: E.muted, fontSize: 12, textAlign: "right", marginTop: 3 },
  pill: { alignSelf: "flex-end", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: "700" },
});

export const cardStyle: ViewStyle = [styles.card, shadows.card] as unknown as ViewStyle;
