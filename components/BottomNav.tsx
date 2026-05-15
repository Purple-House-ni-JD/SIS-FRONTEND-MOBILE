import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

export default function BottomNav({ activeRoute }: { activeRoute: string }) {
  const router = useRouter();
  const tabs = [
    { id: "/dashboard", label: "Home", icon: "🏠" },
    { id: "/grades", label: "Grades", icon: "📝" },
    { id: "/announcements", label: "News", icon: "📢" }, // <-- Added this new tab
    { id: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <View style={styles.navContainer}>
      {tabs.map((tab) => {
        const isActive = activeRoute === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => router.replace(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, isActive && styles.activeIcon]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  icon: {
    fontSize: 22,
    opacity: 0.5,
    marginBottom: 4,
  },
  activeIcon: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeLabel: {
    color: "#000080", // Navy
    fontWeight: "800",
  },
  activeIndicator: {
    position: "absolute",
    top: -12,
    width: 30,
    height: 3,
    backgroundColor: "#FFD700", // Gold
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
