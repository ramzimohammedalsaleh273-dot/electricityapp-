import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { E } from "@/constants/electricity-theme";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: E.gold, tabBarInactiveTintColor: "#9AA9B5", tabBarStyle: { height: 62 + bottomPadding, paddingTop: 7, paddingBottom: bottomPadding, backgroundColor: E.navy, borderTopColor: "#29445A", borderTopWidth: 1 }, tabBarLabelStyle: { fontSize: 10, fontWeight: "700" } }}>
    <Tabs.Screen name="index" options={{ title: "الرئيسية", tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} /> }} />
    <Tabs.Screen name="saved" options={{ title: "المحفوظة", tabBarIcon: ({ color, size }) => <Ionicons name="archive" size={size} color={color} /> }} />
    <Tabs.Screen name="tenants" options={{ title: "المستأجرون", tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
    <Tabs.Screen name="settings" options={{ title: "الإعدادات", tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} /> }} />
  </Tabs>;
}
