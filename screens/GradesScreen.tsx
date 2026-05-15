import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import BottomNav from "../components/BottomNav";

const MOCK_GRADES = [
  {
    id: "1",
    code: "CS 101",
    title: "Intro to Computing",
    midterm: 92,
    finals: 96,
    overall: 94.0,
  },
  {
    id: "2",
    code: "MATH 201",
    title: "Calculus I",
    midterm: 78,
    finals: 85,
    overall: 81.5,
  },
  {
    id: "3",
    code: "ENG 102",
    title: "Technical Writing",
    midterm: 88,
    finals: null,
    overall: null,
  },
];

function getGradeColor(score: number | null) {
  if (score === null) return { bg: "#F3F4F6", text: "#9CA3AF" }; // Gray (Pending)
  if (score >= 90) return { bg: "#D1FAE5", text: "#065F46" }; // Green
  if (score >= 75) return { bg: "#DBEAFE", text: "#1E40AF" }; // Blue
  if (score >= 60) return { bg: "#FEF3C7", text: "#B45309" }; // Yellow
  return { bg: "#FEE2E2", text: "#991B1B" }; // Red
}

export default function GradesScreen() {
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* ── Header ── */}
        <View style={styles.hero}>
          <Text style={styles.termText}>First Semester, 2025-2026</Text>
          <Text style={styles.title}>Academic Grades</Text>
        </View>

        {/* ── Grades List ── */}
        <View style={styles.body}>
          {MOCK_GRADES.map((grade) => {
            const overallColors = getGradeColor(grade.overall);

            return (
              <View key={grade.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.courseCode}>{grade.code}</Text>
                  <Text style={styles.courseTitle}>{grade.title}</Text>
                </View>

                <View style={styles.gradesGrid}>
                  {/* Midterm Column */}
                  <View style={styles.gradeCol}>
                    <Text style={styles.gradeLabel}>MIDTERM</Text>
                    <Text style={styles.gradeValue}>
                      {grade.midterm || "—"}
                    </Text>
                  </View>

                  {/* Finals Column */}
                  <View style={styles.gradeCol}>
                    <Text style={styles.gradeLabel}>FINALS</Text>
                    <Text style={styles.gradeValue}>{grade.finals || "—"}</Text>
                  </View>

                  {/* Overall Column */}
                  <View
                    style={[
                      styles.gradeCol,
                      styles.overallCol,
                      { backgroundColor: overallColors.bg },
                    ]}
                  >
                    <Text
                      style={[styles.gradeLabel, { color: overallColors.text }]}
                    >
                      OVERALL
                    </Text>
                    <Text
                      style={[
                        styles.gradeValue,
                        styles.overallValue,
                        { color: overallColors.text },
                      ]}
                    >
                      {grade.overall ? grade.overall.toFixed(1) : "—"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Put the Bottom Nav at the very bottom of the screen */}
      <BottomNav activeRoute="/grades" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { paddingBottom: 20 },
  hero: {
    backgroundColor: "#000080",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  termText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  body: { paddingHorizontal: 16, paddingTop: 20 },
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
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 12,
  },
  courseCode: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 2,
  },
  courseTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  gradesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gradeCol: { flex: 1, alignItems: "center" },
  overallCol: { paddingVertical: 8, borderRadius: 8 },
  gradeLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  gradeValue: { fontSize: 18, fontWeight: "600", color: "#374151" },
  overallValue: { fontSize: 20, fontWeight: "bold" },
});
