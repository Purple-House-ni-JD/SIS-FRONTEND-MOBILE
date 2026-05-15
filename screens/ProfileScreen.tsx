import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { getMyEnrollments, updateCurrentUser } from "../services/api";
import { Enrollment, User } from "../constants/types";
import { Colors, Spacing, BorderRadius, Shadows } from "../constants/theme";
import BottomNav from "../components/BottomNav";

const { width } = Dimensions.get("window");

// ─── Grade badge colour ──────────────────────────────────────────────────────
function gradeColor(score: number) {
  if (score >= 90) return { bg: Colors.successLight, text: Colors.success };
  if (score >= 75) return { bg: Colors.infoLight, text: Colors.info };
  if (score >= 60) return { bg: Colors.warningLight, text: Colors.warning };
  return { bg: Colors.errorLight, text: Colors.error };
}

// ─── Year level label ────────────────────────────────────────────────────────
function yearLabel(level: number) {
  const map: Record<number, string> = {
    1: "1st Year",
    2: "2nd Year",
    3: "3rd Year",
    4: "4th Year",
  };
  return map[level] ?? `Year ${level}`;
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={sectionStyles.header}>
      <View style={sectionStyles.bar} />
      <Text style={sectionStyles.title}>{title}</Text>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  bar: {
    width: 3,
    height: 18,
    backgroundColor: Colors.gold,
    borderRadius: 2,
    marginRight: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.navy,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray100,
  },
  label: { fontSize: 13, color: Colors.gray500, flex: 1 },
  value: {
    fontSize: 13,
    color: Colors.gray900,
    fontWeight: "600",
    flex: 1.5,
    textAlign: "right",
  },
});

function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <View
      style={[badgeStyles.badge, verified ? badgeStyles.yes : badgeStyles.no]}
    >
      <Text
        style={[
          badgeStyles.text,
          verified ? badgeStyles.yesText : badgeStyles.noText,
        ]}
      >
        {verified ? "✓  Verified" : "✗  Unverified"}
      </Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  yes: { backgroundColor: Colors.successLight },
  no: { backgroundColor: Colors.errorLight },
  text: { fontSize: 12, fontWeight: "700" },
  yesText: { color: Colors.success },
  noText: { color: Colors.error },
});

function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  const grade = enrollment.grade;
  const colors = grade ? gradeColor(grade.score) : null;

  return (
    <View style={courseStyles.card}>
      {/* Course header */}
      <View style={courseStyles.cardTop}>
        <View style={courseStyles.codeTag}>
          <Text style={courseStyles.codeText}>{enrollment.course.code}</Text>
        </View>
        {grade && colors && (
          <View
            style={[courseStyles.scoreBadge, { backgroundColor: colors.bg }]}
          >
            <Text style={[courseStyles.scoreText, { color: colors.text }]}>
              {grade.score.toFixed(1)}
            </Text>
          </View>
        )}
        {!grade && (
          <View
            style={[
              courseStyles.scoreBadge,
              { backgroundColor: Colors.gray100 },
            ]}
          >
            <Text style={[courseStyles.scoreText, { color: Colors.gray400 }]}>
              —
            </Text>
          </View>
        )}
      </View>

      <Text style={courseStyles.title}>{enrollment.course.title}</Text>
      <Text style={courseStyles.instructor}>
        by {enrollment.course.instructor_name}
      </Text>

      {/* Grade row */}
      {grade ? (
        <View style={courseStyles.gradeRow}>
          <View
            style={[
              courseStyles.remarksPill,
              colors ? { backgroundColor: colors.bg } : {},
            ]}
          >
            <Text
              style={[
                courseStyles.remarksText,
                colors ? { color: colors.text } : {},
              ]}
            >
              {grade.remarks}
            </Text>
          </View>
          <Text style={courseStyles.updated}>
            Updated{" "}
            {new Date(grade.updated_at).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
      ) : (
        <Text style={courseStyles.noGrade}>No grade recorded yet</Text>
      )}

      {/* Enrolled date */}
      <Text style={courseStyles.enrolled}>
        Enrolled{" "}
        {new Date(enrollment.enrolled_at).toLocaleDateString("en-PH", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </Text>
    </View>
  );
}

const courseStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.gray200,
    ...Shadows.sm,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  codeTag: {
    backgroundColor: Colors.navy,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  codeText: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  scoreBadge: {
    borderRadius: BorderRadius.full,
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
  },
  scoreText: { fontSize: 14, fontWeight: "800" },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.gray900,
    marginBottom: 2,
  },
  instructor: { fontSize: 12, color: Colors.gray500, marginBottom: 8 },
  gradeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  remarksPill: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: Colors.gray100,
  },
  remarksText: { fontSize: 12, fontWeight: "600", color: "#4B5563" },
  updated: { fontSize: 11, color: Colors.gray400 },
  noGrade: {
    fontSize: 12,
    color: Colors.gray400,
    fontStyle: "italic",
    marginBottom: 4,
  },
  enrolled: { fontSize: 11, color: Colors.gray300, marginTop: 4 },
});

// ─── Edit Profile Modal ──────────────────────────────────────────────────────

interface EditModalProps {
  visible: boolean;
  user: User;
  onClose: () => void;
  onSaved: (updated: User) => void;
}

function EditProfileModal({ visible, user, onClose, onSaved }: EditModalProps) {
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateCurrentUser({
        first_name: firstName,
        last_name: lastName,
        email,
      });
      onSaved(updated);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={modalStyles.root}>
          {/* Header */}
          <View style={modalStyles.header}>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={modalStyles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={modalStyles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={Colors.gold} />
              ) : (
                <Text style={modalStyles.save}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={modalStyles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* Note about read-only fields */}
            <View style={modalStyles.infoNote}>
              <Text style={modalStyles.infoNoteText}>
                ℹ️ Username, role, and student profile fields (student ID,
                program, year level) are managed by your administrator.
              </Text>
            </View>

            <Text style={modalStyles.sectionLabel}>Personal Information</Text>

            <View style={modalStyles.fieldGroup}>
              <Text style={modalStyles.label}>First Name</Text>
              <TextInput
                style={modalStyles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={Colors.gray300}
              />
            </View>

            <View style={modalStyles.fieldGroup}>
              <Text style={modalStyles.label}>Last Name</Text>
              <TextInput
                style={modalStyles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor={Colors.gray300}
              />
            </View>

            <View style={modalStyles.fieldGroup}>
              <Text style={modalStyles.label}>Email Address</Text>
              <TextInput
                style={modalStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                placeholderTextColor={Colors.gray300}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Read-only preview */}
            <Text style={[modalStyles.sectionLabel, { marginTop: 24 }]}>
              Read-only Fields
            </Text>
            <View style={modalStyles.readOnlyGroup}>
              <InfoRow label="Username" value={user.username} />
              <InfoRow
                label="Role"
                value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              />
              {user.student_profile && (
                <>
                  <InfoRow
                    label="Student ID"
                    value={user.student_profile.student_id}
                  />
                  <InfoRow
                    label="Program"
                    value={user.student_profile.program}
                  />
                  <InfoRow
                    label="Year Level"
                    value={yearLabel(user.student_profile.year_level)}
                  />
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.offWhite },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray200,
    paddingTop: Platform.OS === "ios" ? 20 : 14,
  },
  title: { fontSize: 17, fontWeight: "700", color: Colors.navy },
  cancel: { fontSize: 16, color: Colors.gray500 },
  save: { fontSize: 16, fontWeight: "700", color: Colors.gold },
  content: { padding: Spacing.md, paddingBottom: 40 },
  infoNote: {
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: Spacing.md,
  },
  infoNoteText: { fontSize: 13, color: Colors.info, lineHeight: 18 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.gray400,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },
  fieldGroup: { marginBottom: Spacing.sm },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.gray700,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.gray900,
    borderWidth: 1,
    borderColor: Colors.gray200,
    ...Shadows.sm,
  },
  readOnlyGroup: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
});

// ─── Main Profile Screen ─────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user: authUser, logout, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  async function fetchEnrollments() {
    try {
      const data = await getMyEnrollments();
      setEnrollments(data);
    } catch {
      // Endpoint may not exist yet — silently fail
    } finally {
      setLoadingEnrollments(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshUser(), fetchEnrollments()]);
      setUser(authUser);
    } finally {
      setRefreshing(false);
    }
  }, [authUser]);

  function handleLogout() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: logout },
    ]);
  }

  if (!user) return null;

  const sp = user.student_profile;
  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.username;
  const initials =
    [user.first_name?.[0], user.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || user.username.slice(0, 2).toUpperCase();

  // GPA-style average
  const gradedEnrollments = enrollments.filter((e) => e.grade);
  const average = gradedEnrollments.length
    ? gradedEnrollments.reduce((sum, e) => sum + (e.grade?.score ?? 0), 0) /
      gradedEnrollments.length
    : null;

  return (
    <>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
          />
        }
      >
        {/* ── Hero header ── */}
        <View style={styles.hero}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <View style={styles.sisLogo}>
              <Text style={styles.sisLogoText}>SIS</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Sign out</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar + name */}
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{fullName}</Text>
              <Text style={styles.heroUsername}>@{user.username}</Text>
              <VerifiedBadge verified={user.is_verified} />
            </View>
          </View>

          {/* Stats strip */}
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{enrollments.length}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{gradedEnrollments.length}</Text>
              <Text style={styles.statLabel}>Graded</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {average !== null ? average.toFixed(1) : "—"}
              </Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            {sp && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {yearLabel(sp.year_level)}
                  </Text>
                  <Text style={styles.statLabel}>Level</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>
          {/* ── Account Info ── */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <SectionHeader title="Account Information" />
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setEditVisible(true)}
              >
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <InfoRow label="Full Name" value={fullName || "—"} />
            <InfoRow label="Username" value={user.username} />
            <InfoRow label="Email" value={user.email || "—"} />
            <InfoRow
              label="Role"
              value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            />
            <InfoRow
              label="Account Status"
              value={user.is_verified ? "Verified" : "Pending Verification"}
            />
          </View>

          {/* ── Student Profile ── */}
          {sp ? (
            <View style={styles.card}>
              <SectionHeader title="Student Profile" />
              <InfoRow label="Student ID" value={sp.student_id} />
              <InfoRow label="Program" value={sp.program} />
              <InfoRow label="Year Level" value={yearLabel(sp.year_level)} />
            </View>
          ) : (
            <View style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyIcon}>🎓</Text>
              <Text style={styles.emptyTitle}>No student profile</Text>
              <Text style={styles.emptySubtitle}>
                Contact your administrator to set up your student profile.
              </Text>
            </View>
          )}

          {/* ── Enrollments & Grades ── */}
          <View style={styles.card}>
            <SectionHeader title="Enrolled Courses & Grades" />

            {loadingEnrollments ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={Colors.gold} />
                <Text style={styles.loadingText}>Loading courses…</Text>
              </View>
            ) : enrollments.length === 0 ? (
              <View style={styles.emptyInline}>
                <Text style={styles.emptyIcon}>📚</Text>
                <Text style={styles.emptyTitle}>No enrollments yet</Text>
                <Text style={styles.emptySubtitle}>
                  Your enrolled courses and grades will appear here.
                </Text>
              </View>
            ) : (
              enrollments.map((e) => (
                <EnrollmentCard key={e.id} enrollment={e} />
              ))
            )}
          </View>

          {/* ── Danger zone ── */}
          <View style={[styles.card, styles.dangerCard]}>
            <SectionHeader title="Account" />
            <TouchableOpacity style={styles.signOutRow} onPress={handleLogout}>
              <Text style={styles.signOutText}>Sign out</Text>
              <Text style={styles.signOutArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit modal */}
      {user && (
        <EditProfileModal
          visible={editVisible}
          user={user}
          onClose={() => setEditVisible(false)}
          onSaved={(updated) => {
            setUser(updated);
            setEditVisible(false);
          }}
        />
      )}
      <BottomNav activeRoute="/profile" />
    </>
  );
}

const HERO_HEIGHT = 280;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  content: {
    paddingBottom: 40,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    backgroundColor: Colors.navy,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 28,
    paddingHorizontal: Spacing.md,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...Shadows.md,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  sisLogo: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  sisLogoText: {
    color: Colors.navy,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  logoutText: { color: Colors.white, fontSize: 13, fontWeight: "500" },

  // ── Avatar & Name ─────────────────────────────────────────────────────────
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.15)",
    marginRight: 16,
  },
  avatarText: {
    color: Colors.navy,
    fontSize: 26,
    fontWeight: "800",
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  heroUsername: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    marginBottom: 8,
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsStrip: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 4,
  },

  // ── Body ──────────────────────────────────────────────────────────────────
  body: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
    ...Shadows.sm,
    marginBottom: 0,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: -4,
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.navy,
    borderRadius: BorderRadius.full,
  },
  editBtnText: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Empty states ──────────────────────────────────────────────────────────
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  emptyInline: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.gray700,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.gray400,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },

  // ── Loading ───────────────────────────────────────────────────────────────
  loadingBox: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    gap: 8,
  },
  loadingText: {
    color: Colors.gray400,
    fontSize: 13,
  },

  // ── Danger / sign out ─────────────────────────────────────────────────────
  dangerCard: {
    borderColor: Colors.errorLight,
  },
  signOutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  signOutText: {
    fontSize: 15,
    color: Colors.error,
    fontWeight: "600",
  },
  signOutArrow: {
    fontSize: 16,
    color: Colors.error,
  },
});
