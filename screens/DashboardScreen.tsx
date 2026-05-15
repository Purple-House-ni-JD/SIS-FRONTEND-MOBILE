import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import BottomNav from "../components/BottomNav";

// --- Mock Data ---
const MOCK_ANNOUNCEMENTS = [
  {
    id: "1",
    title: "Midterm Examination Schedule",
    date: "May 15, 2026",
    content:
      "Please be reminded that midterm examinations will begin next week. Ensure your clearance is settled.",
    isImportant: true,
  },
  {
    id: "2",
    title: "Campus Wi-Fi Maintenance",
    date: "May 12, 2026",
    content:
      "The main library will experience intermittent internet connectivity this Friday due to server upgrades.",
    isImportant: false,
  },
];

const MOCK_RECENT_GRADES = [
  { id: "1", code: "CS 101", title: "Intro to Computing", score: 95.5 },
  { id: "2", code: "MATH 201", title: "Calculus I", score: 82.0 },
];

// Helper to color-code grades
function getGradeColor(score: number) {
  if (score >= 90) return { bg: "#D1FAE5", text: "#065F46" }; // Success (Green)
  if (score >= 75) return { bg: "#DBEAFE", text: "#1E40AF" }; // Info (Blue)
  if (score >= 60) return { bg: "#FEF3C7", text: "#B45309" }; // Warning (Yellow)
  return { bg: "#FEE2E2", text: "#991B1B" }; // Error (Red)
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Safely get the user's first name and initial
  const firstName = user?.first_name || "Student";
  const initial = firstName.charAt(0).toUpperCase() || "?";

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        {/* ── Hero Header ── */}
        <View style={styles.hero}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.nameText}>{firstName}</Text>
            </View>

            {/* Profile Navigation Button */}
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => router.push("/profile")}
              activeOpacity={0.8}
            >
              <Text style={styles.profileInitial}>{initial}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Main Content ── */}
        <View style={styles.body}>
          {/* ── Announcements Section ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Announcements</Text>
          </View>

          {MOCK_ANNOUNCEMENTS.map((announcement) => (
            <View key={announcement.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{announcement.title}</Text>
                {announcement.isImportant && (
                  <View style={styles.importantBadge}>
                    <Text style={styles.importantText}>!</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardDate}>{announcement.date}</Text>
              <Text style={styles.cardContent}>{announcement.content}</Text>
            </View>
          ))}

          {/* ── Recent Grades Section ── */}
          <View style={[styles.sectionHeader, { marginTop: 16 }]}>
            <Text style={styles.sectionTitle}>Recent Grades</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {MOCK_RECENT_GRADES.map((grade, index) => {
              const colors = getGradeColor(grade.score);
              const isLast = index === MOCK_RECENT_GRADES.length - 1;

              return (
                <View
                  key={grade.id}
                  style={[styles.gradeRow, !isLast && styles.gradeBorder]}
                >
                  <View style={styles.gradeInfo}>
                    <Text style={styles.courseCode}>{grade.code}</Text>
                    <Text style={styles.courseTitle}>{grade.title}</Text>
                  </View>
                  <View
                    style={[styles.scoreBadge, { backgroundColor: colors.bg }]}
                  >
                    <Text style={[styles.scoreText, { color: colors.text }]}>
                      {grade.score.toFixed(1)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <BottomNav activeRoute="/dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F3F4F6", // OffWhite
  },
  content: {
    paddingBottom: 40,
  },

  // ── Hero ──
  hero: {
    backgroundColor: "#000080", // Navy
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dateText: {
    color: "#FFD700", // Gold
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  welcomeText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    marginBottom: 2,
  },
  nameText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFD700", // Gold
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  profileInitial: {
    color: "#000080", // Navy
    fontSize: 20,
    fontWeight: "bold",
  },

  // ── Body ──
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827", // Gray 900
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000080", // Navy
  },

  // ── Cards ──
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  importantBadge: {
    backgroundColor: "#FEE2E2",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  importantText: {
    color: "#991B1B",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardDate: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },

  // ── Grades List ──
  gradeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  gradeBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  gradeInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 2,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
