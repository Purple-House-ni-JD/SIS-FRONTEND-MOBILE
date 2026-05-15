import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { Colors, Shadows, BorderRadius, Spacing } from "../constants/theme";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      Alert.alert(
        "Sign in failed",
        err.message || "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* ── Top navy hero with diagonal clip ── */}
        <View style={styles.hero}>
          {/* Gold left accent bar */}
          <View style={styles.goldAccentBar} />

          <View style={styles.heroContent}>
            {/* SIS Logo badge */}
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>SIS</Text>
            </View>

            <Text style={styles.heroLabel}>STUDENT INFORMATION SYSTEM</Text>
            <Text style={styles.heroTagline}>
              Learn with purpose.{"\n"}Lead with integrity.
            </Text>
          </View>

          {/* Diagonal bottom cut */}
          <View style={styles.diagonalCut} />
        </View>

        {/* ── Sign-in card ── */}
        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in</Text>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="your.username"
                placeholderTextColor={Colors.gray400}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.gray400}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? "🙈" : "👁"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign in button */}
            <TouchableOpacity
              style={[styles.signInBtn, loading && styles.signInBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Colors.navy} />
              ) : (
                <Text style={styles.signInBtnText}>Sign in</Text>
              )}
            </TouchableOpacity>

            {/* Divider note */}
            <Text style={styles.footerNote}>
              Contact your administrator if you cannot access your account.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const HERO_HEIGHT = height * 0.42;
const DIAGONAL_HEIGHT = 60;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  scroll: {
    flexGrow: 1,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: Colors.navy,
    position: "relative",
    overflow: "hidden",
  },
  goldAccentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.gold,
  },
  heroContent: {
    flex: 1,
    paddingLeft: 36,
    paddingRight: 24,
    justifyContent: "center",
    paddingTop: 48,
    paddingBottom: DIAGONAL_HEIGHT,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoText: {
    color: Colors.navy,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroLabel: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.5,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  heroTagline: {
    color: Colors.white,
    fontSize: 26,
    fontStyle: "italic",
    fontWeight: "300",
    lineHeight: 36,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  // Diagonal clipped bottom edge
  diagonalCut: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: DIAGONAL_HEIGHT,
    backgroundColor: Colors.offWhite,
    transform: [{ skewY: "-4deg" }, { translateY: DIAGONAL_HEIGHT / 2 }],
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  cardWrapper: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    marginTop: -Spacing.sm,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.navy,
    marginBottom: Spacing.lg,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  // ── Fields ────────────────────────────────────────────────────────────────
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.gray700,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.gray900,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  passwordWrapper: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  eyeIcon: {
    fontSize: 16,
  },

  // ── Button ────────────────────────────────────────────────────────────────
  signInBtn: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.md,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  signInBtnDisabled: {
    opacity: 0.7,
  },
  signInBtnText: {
    color: Colors.navy,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  footerNote: {
    marginTop: Spacing.md,
    fontSize: 12,
    color: Colors.gray400,
    textAlign: "center",
    lineHeight: 18,
  },
});
