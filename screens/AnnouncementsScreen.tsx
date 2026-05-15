import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  TextInput,
} from "react-native";
import BottomNav from "../components/BottomNav";

const MOCK_ANNOUNCEMENTS = [
  {
    id: "1",
    title: "Midterm Examination Schedule",
    date: "May 15, 2026",
    category: "Academic",
    content:
      "Please be reminded that midterm examinations will begin next week. Ensure your clearance is settled with the registrar and finance office before Monday.",
    isImportant: true,
  },
  {
    id: "2",
    title: "Campus Wi-Fi Maintenance",
    date: "May 12, 2026",
    category: "IT Support",
    content:
      "The main library and student lounge will experience intermittent internet connectivity this Friday from 8:00 PM to 12:00 AM due to server upgrades.",
    isImportant: false,
  },
  {
    id: "3",
    title: "University Intramurals 2026",
    date: "May 08, 2026",
    category: "Events",
    content:
      "Get ready! The annual University Intramurals kick off next month. Register for your department's sports teams by the end of this week.",
    isImportant: false,
  },
  {
    id: "4",
    title: "Updated Library Hours",
    date: "May 02, 2026",
    category: "Facility",
    content:
      "Starting next week, the university library will extend its hours until 9:00 PM to accommodate students reviewing for the upcoming midterms.",
    isImportant: false,
  },
];

export default function AnnouncementsScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  // Simple filter to search announcements by title or content
  const filteredAnnouncements = MOCK_ANNOUNCEMENTS.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Header ── */}
        <View style={styles.hero}>
          <Text style={styles.heroSubtitle}>Stay Updated</Text>
          <Text style={styles.heroTitle}>Announcements</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search news & updates..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* ── Announcements List ── */}
        <View style={styles.body}>
          {filteredAnnouncements.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No announcements found.</Text>
            </View>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <TouchableOpacity
                key={announcement.id}
                style={styles.card}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryText}>
                      {announcement.category}
                    </Text>
                  </View>
                  <Text style={styles.cardDate}>{announcement.date}</Text>
                </View>

                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>{announcement.title}</Text>
                  {announcement.isImportant && (
                    <View style={styles.importantBadge}>
                      <Text style={styles.importantText}>!</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.cardContent}>{announcement.content}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Persistent Bottom Nav */}
      <BottomNav activeRoute="/announcements" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { paddingBottom: 20 },

  // ── Hero ──
  hero: {
    backgroundColor: "#000080", // Navy
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroSubtitle: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  searchIcon: { fontSize: 16, marginRight: 8, opacity: 0.7 },
  searchInput: { flex: 1, height: 44, color: "#FFFFFF", fontSize: 15 },

  // ── Body ──
  body: { paddingHorizontal: 16, paddingTop: 20 },

  // ── Cards ──
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryPill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
    textTransform: "uppercase",
  },
  cardDate: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    paddingRight: 8,
  },
  importantBadge: {
    backgroundColor: "#FEE2E2",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  importantText: { color: "#991B1B", fontSize: 13, fontWeight: "bold" },
  cardContent: { fontSize: 14, color: "#4B5563", lineHeight: 22 },

  // ── Empty State ──
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, color: "#6B7280", fontWeight: "500" },
});
