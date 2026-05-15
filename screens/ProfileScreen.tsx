import React, { useState, useCallback } from "react";
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
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { User } from "../constants/types";
import { Colors, Spacing, BorderRadius, Shadows } from "../constants/theme";
import BottomNav from "../components/BottomNav";

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

// ─── Change Password Modal ──────────────────────────────────────────────────

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleChangePassword() {
    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Missing fields", "Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return;
    }

    setSaving(true);
    try {
      // Call backend change password endpoint
      const response = await fetch(
        "http://192.168.1.7:8000/auth/users/set_password/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAccessToken()}`,
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.detail ||
            error.non_field_errors?.[0] ||
            "Failed to change password",
        );
      }

      Alert.alert("Success", "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not change password.");
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
          <View style={modalStyles.header}>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={modalStyles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={modalStyles.title}>Change Password</Text>
            <TouchableOpacity onPress={handleChangePassword} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={Colors.gold} />
              ) : (
                <Text style={modalStyles.save}>Update</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={modalStyles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={modalStyles.infoNote}>
              <Text style={modalStyles.infoNoteText}>
                ℹ️ Password must be at least 8 characters and different from
                your current password.
              </Text>
            </View>

            {/* Current Password */}
            <View style={modalStyles.fieldGroup}>
              <Text style={modalStyles.label}>Current Password</Text>
              <View style={modalStyles.passwordWrapper}>
                <TextInput
                  style={modalStyles.passwordInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={Colors.gray300}
                  secureTextEntry={!showCurrent}
                />
                <TouchableOpacity
                  style={modalStyles.eyeBtn}
                  onPress={() => setShowCurrent((v) => !v)}
                >
                  <Text style={modalStyles.eyeIcon}>
                    {showCurrent ? "🙈" : "👁"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={modalStyles.fieldGroup}>
              <Text style={modalStyles.label}>New Password</Text>
              <View style={modalStyles.passwordWrapper}>
                <TextInput
                  style={modalStyles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={Colors.gray300}
                  secureTextEntry={!showNew}
                />
                <TouchableOpacity
                  style={modalStyles.eyeBtn}
                  onPress={() => setShowNew((v) => !v)}
                >
                  <Text style={modalStyles.eyeIcon}>
                    {showNew ? "🙈" : "👁"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={modalStyles.fieldGroup}>
              <Text style={modalStyles.label}>Confirm Password</Text>
              <View style={modalStyles.passwordWrapper}>
                <TextInput
                  style={modalStyles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor={Colors.gray300}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity
                  style={modalStyles.eyeBtn}
                  onPress={() => setShowConfirm((v) => !v)}
                >
                  <Text style={modalStyles.eyeIcon}>
                    {showConfirm ? "🙈" : "👁"}
                  </Text>
                </TouchableOpacity>
              </View>
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
  fieldGroup: { marginBottom: Spacing.md },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.gray700,
    marginBottom: 6,
  },
  passwordWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    paddingRight: 48,
    fontSize: 15,
    color: Colors.gray900,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
  eyeIcon: {
    fontSize: 16,
  },
});

// ─── Helper to get access token ──────────────────────────────────────────────
import * as SecureStore from "expo-secure-store";

async function getAccessToken() {
  return await SecureStore.getItemAsync("access_token");
}

// ─── Main Profile Screen ─────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user: authUser, logout, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);
  const [refreshing, setRefreshing] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      setUser(authUser);
    } finally {
      setRefreshing(false);
    }
  }, [authUser, refreshUser]);

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
          <View style={styles.topBar}>
            <View style={styles.sisLogo}>
              <Text style={styles.sisLogoText}>SIS</Text>
            </View>
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
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>
          {/* ── Academic Profile (Read-only) ── */}
          <View style={styles.card}>
            <SectionHeader title="Academic Profile" />
            <InfoRow label="Student name" value={fullName} />
            <InfoRow label="Student ID" value={sp?.student_id ?? "—"} />
            <InfoRow label="Program" value={sp?.program ?? "—"} />
            <InfoRow
              label="Year level"
              value={sp?.year_level != null ? yearLabel(sp.year_level) : "—"}
            />
          </View>

          {/* ── Contact (Read-only) ── */}
          <View style={styles.card}>
            <SectionHeader title="Contact" />
            <InfoRow label="Email" value={user.email || "—"} />
          </View>

          {/* ── Security ── */}
          <View style={styles.card}>
            <SectionHeader title="Security" />
            <TouchableOpacity
              style={styles.securityRow}
              onPress={() => setPasswordModalVisible(true)}
            >
              <Text style={styles.securityText}>Change Password</Text>
              <Text style={styles.securityArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* ── Account (Sign out) ── */}
          <View style={[styles.card, styles.dangerCard]}>
            <SectionHeader title="Account" />
            <TouchableOpacity style={styles.signOutRow} onPress={handleLogout}>
              <Text style={styles.signOutText}>Sign out</Text>
              <Text style={styles.signOutArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />

      <BottomNav activeRoute="/profile" />
    </>
  );
}

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
    paddingBottom: 32,
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

  // ── Avatar & Name ─────────────────────────────────────────────────────────
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
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

  // ── Security / Password ───────────────────────────────────────────────────
  securityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  securityText: {
    fontSize: 15,
    color: Colors.navy,
    fontWeight: "600",
  },
  securityArrow: {
    fontSize: 16,
    color: Colors.gold,
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
