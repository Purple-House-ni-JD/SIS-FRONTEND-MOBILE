import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { getCourses, getGrades, getAnnouncements } from "../services/api";
import { Course, Grade, Announcement } from "../constants/types";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import BottomNav from "../components/BottomNav";

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.first_name || "Student";

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setError(null);
      setLoading(true);
      const [coursesData, gradesData, announcementsData] = await Promise.all([
        getCourses(),
        getGrades(),
        getAnnouncements(),
      ]);
      setCourses(coursesData);
      setGrades(gradesData);
      setAnnouncements(announcementsData);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      await loadDashboard();
    } finally {
      setRefreshing(false);
    }
  }

  const summary = [
    {
      label: "Enrolled courses",
      value: courses.length,
      hint: "Courses linked to your enrollments.",
    },
    {
      label: "Posted grades",
      value: grades.length,
      hint: "Grade rows visible to you.",
    },
    {
      label: "Announcements",
      value: announcements.length,
      hint: "Posts in the feed.",
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Student</Text>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.description}>
            Counts and lists loaded from the API for your account.
          </Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.gold} />
            <Text style={styles.loadingText}>Loading dashboard…</Text>
          </View>
        ) : (
          <>
            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
              {summary.map((item, idx) => (
                <View key={idx} style={styles.metricCard}>
                  <Text style={styles.metricValue}>{item.value}</Text>
                  <Text style={styles.metricLabel}>{item.label}</Text>
                  <Text style={styles.metricHint}>{item.hint}</Text>
                </View>
              ))}
            </View>

            {/* Two-column grid for courses and grades */}
            <View style={styles.gridContainer}>
              {/* Enrolled Courses Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Enrolled Courses</Text>
                  <Text style={styles.sectionDescription}>
                    From the course endpoint.
                  </Text>
                </View>

                {courses.length === 0 ? (
                  <Text style={styles.emptyText}>No courses enrolled yet.</Text>
                ) : (
                  <View style={styles.list}>
                    {courses.map((course) => (
                      <TouchableOpacity
                        key={course.id}
                        style={styles.listItem}
                        activeOpacity={0.7}
                      >
                        <View style={styles.itemTitleRow}>
                          <Text style={styles.itemTitle}>
                            {course.code} — {course.title}
                          </Text>
                          <View style={styles.chip}>
                            <Text style={styles.chipText}>Enrolled</Text>
                          </View>
                        </View>
                        <Text style={styles.itemMeta}>
                          Instructor: {course.instructor_id}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Grades Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Posted Grades</Text>
                  <Text style={styles.sectionDescription}>
                    Latest grades visible to you.
                  </Text>
                </View>

                {grades.length === 0 ? (
                  <Text style={styles.emptyText}>No grades posted yet.</Text>
                ) : (
                  <View style={styles.list}>
                    {grades.map((grade) => (
                      <TouchableOpacity
                        key={grade.id}
                        style={styles.listItem}
                        activeOpacity={0.7}
                      >
                        <View style={styles.itemTitleRow}>
                          <Text style={styles.itemTitle}>
                            {grade.course_title}
                          </Text>
                          <View style={[styles.chip, styles.chipGreen]}>
                            <Text style={styles.chipText}>Graded</Text>
                          </View>
                        </View>
                        <Text style={styles.itemMeta}>
                          Score: {grade.score} · {grade.remarks}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <BottomNav activeRoute="/dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: Colors.navy,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  eyebrow: {
    fontSize: 12,
    color: Colors.gold,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 20,
  },
  error: {
    color: Colors.error,
    padding: Spacing.md,
    backgroundColor: Colors.errorLight,
    margin: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.gray500,
  },
  metricsGrid: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  metricCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.gold,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.navy,
    marginBottom: 4,
  },
  metricHint: {
    fontSize: 12,
    color: Colors.gray500,
    lineHeight: 16,
  },
  gridContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.navy,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: Colors.gray500,
  },
  list: {
    gap: Spacing.sm,
  },
  listItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray200,
    paddingVertical: Spacing.md,
  },
  itemTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.navy,
    flex: 1,
  },
  chip: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  chipGreen: {
    backgroundColor: Colors.successLight,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.info,
  },
  itemMeta: {
    fontSize: 12,
    color: Colors.gray500,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.gray400,
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
});
