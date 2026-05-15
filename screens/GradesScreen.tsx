import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { getCourses, getGrades } from "../services/api";
import { Course, Grade } from "../constants/types";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import BottomNav from "../components/BottomNav";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getGradeColor(score: number) {
  // 1.0 is highest, 3.0 is passing, 5.0 is lowest
  if (score <= 1.5)
    return { bg: "#D1FAE5", text: "#065F46", label: "Excellent" };
  if (score <= 2.5) return { bg: "#DBEAFE", text: "#1E40AF", label: "Good" };
  if (score <= 3.0) return { bg: "#FEF3C7", text: "#B45309", label: "Passing" };

  return { bg: "#FEE2E2", text: "#991B1B", label: "Failed" };
}

export default function GradesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setError(null);
      setLoading(true);
      const [coursesData, gradesData] = await Promise.all([
        getCourses(),
        getGrades(),
      ]);
      setCourses(coursesData);
      setGrades(gradesData);
    } catch (err: any) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }

  // Filter grades by search query
  const filteredGrades = grades.filter(
    (grade) =>
      grade.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.remarks.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate average
  const avgScore =
    grades.length > 0
      ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(2)
      : "—";

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
          <Text style={styles.title}>Courses & Grades</Text>
          <Text style={styles.description}>
            Your enrolled courses and academic performance.
          </Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.gold} />
            <Text style={styles.loadingText}>Loading…</Text>
          </View>
        ) : (
          <>
            {/* Stats Bar */}
            <View style={styles.statsBar}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{courses.length}</Text>
                <Text style={styles.statLabel}>Courses</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{grades.length}</Text>
                <Text style={styles.statLabel}>Graded</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{avgScore}</Text>
                <Text style={styles.statLabel}>Average</Text>
              </View>
            </View>

            {/* Enrolled Courses Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Enrolled Courses</Text>
              </View>

              {courses.length === 0 ? (
                <Text style={styles.emptyText}>No courses enrolled.</Text>
              ) : (
                <View style={styles.coursesList}>
                  {courses.map((course) => (
                    <View key={course.id} style={styles.courseCard}>
                      <View style={styles.courseCardTop}>
                        <View style={styles.courseBadge}>
                          <Text style={styles.courseBadgeText}>
                            {course.code}
                          </Text>
                        </View>
                        <Text style={styles.courseTitle} numberOfLines={2}>
                          {course.title}
                        </Text>
                      </View>
                      <Text style={styles.courseDescription} numberOfLines={2}>
                        {course.description || "No description"}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* My Grades Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Grades</Text>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by course or remarks..."
                  placeholderTextColor={Colors.gray400}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {grades.length === 0 ? (
                <Text style={styles.emptyText}>No grades posted yet.</Text>
              ) : filteredGrades.length === 0 ? (
                <Text style={styles.emptyText}>No results found.</Text>
              ) : (
                <View style={styles.gradesList}>
                  {filteredGrades.map((grade, idx) => {
                    const colors = getGradeColor(grade.score);
                    return (
                      <View key={grade.id} style={styles.gradeCard}>
                        <View style={styles.gradeCardTop}>
                          <View style={styles.gradeInfo}>
                            <Text style={styles.gradeTitle} numberOfLines={1}>
                              {grade.course_title}
                            </Text>
                            <Text style={styles.gradeUpdated}>
                              {formatDate(grade.updated_at)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.scoreBox,
                              { backgroundColor: colors.bg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.scoreValue,
                                { color: colors.text },
                              ]}
                            >
                              {grade.score.toFixed(1)}
                            </Text>
                            <Text
                              style={[
                                styles.scoreLabel,
                                { color: colors.text },
                              ]}
                            >
                              {colors.label}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.remarksPill}>
                          <Text style={styles.remarksText}>
                            {grade.remarks}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
      <BottomNav activeRoute="/grades" />
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

  // Stats Bar
  statsBar: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.gold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.gray500,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.gray200,
  },

  // Section
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.navy,
  },

  // Courses List
  coursesList: {
    gap: Spacing.md,
  },
  courseCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.gold,
  },
  courseCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: Spacing.sm,
  },
  courseBadge: {
    backgroundColor: Colors.navy,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  courseBadgeText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: "700",
  },
  courseTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.navy,
  },
  courseDescription: {
    fontSize: 12,
    color: Colors.gray500,
    lineHeight: 16,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: 13,
    color: Colors.navy,
  },

  // Grades List
  gradesList: {
    gap: Spacing.md,
  },
  gradeCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  gradeCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  gradeInfo: {
    flex: 1,
  },
  gradeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.navy,
    marginBottom: 2,
  },
  gradeUpdated: {
    fontSize: 11,
    color: Colors.gray400,
  },
  scoreBox: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  remarksPill: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  remarksText: {
    fontSize: 12,
    color: Colors.gray700,
    fontWeight: "500",
  },

  // Empty State
  emptyText: {
    fontSize: 13,
    color: Colors.gray400,
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
});
