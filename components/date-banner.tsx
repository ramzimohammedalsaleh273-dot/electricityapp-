import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { E } from "@/constants/electricity-theme";

function nowLabels(date: Date) {
  return {
    day: new Intl.DateTimeFormat("ar-YE", { weekday: "long" }).format(date),
    gregorian: new Intl.DateTimeFormat("ar-YE", { day: "numeric", month: "long", year: "numeric" }).format(date),
    hijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic", { day: "numeric", month: "long", year: "numeric" }).format(date),
    time: new Intl.DateTimeFormat("ar-YE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date),
  };
}
export function DateBanner() {
  const [date, setDate] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setDate(new Date()), 1000); return () => clearInterval(timer); }, []);
  const labels = nowLabels(date);
  return <View style={styles.card}><View><Text style={styles.day}>{labels.day}</Text><Text style={styles.time}>{labels.time}</Text></View><View style={styles.dates}><Text style={styles.gregorian}>ميلادي: {labels.gregorian}</Text><Text style={styles.hijri}>هجري: {labels.hijri}</Text></View></View>;
}
const styles = StyleSheet.create({ card: { backgroundColor: E.paper, borderWidth: 1, borderColor: E.line, borderRadius: 17, padding: 12, marginBottom: 18, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }, day: { color: E.gold, fontSize: 12, fontWeight: "900", textAlign: "right" }, time: { color: E.navy, fontSize: 18, fontWeight: "900", marginTop: 3, textAlign: "right" }, dates: { flex: 1, marginRight: 12 }, gregorian: { color: E.navy, fontSize: 12, fontWeight: "800", textAlign: "right" }, hijri: { color: E.muted, fontSize: 11, marginTop: 4, textAlign: "right" } });
