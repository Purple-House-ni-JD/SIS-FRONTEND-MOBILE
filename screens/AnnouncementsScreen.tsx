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
} from "react-native";
import { getAnnouncements } from "../services/api";
import { Announcement } from "../constants/types";
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

export default function AnnouncementsScreen() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      setError(null);
      setLoading(true);
      const data = await getAnnouncements();
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      await loadAnnouncements();
    } finally {
      setRefreshing(false);
    }
  }

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
          <Text style={styles.title}>Announcements</Text>
          <Text style={styles.description}>
            Campus updates from the API (newest first).
          </Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.gold} />
            <Text style={styles.loadingText}>Loading…</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest posts</Text>
              <Text style={styles.sectionDescription}>
                Posted by faculty and administrators.
              </Text>
            </View>

            {items.length === 0 ? (
              <Text style={styles.emptyText}>No announcements yet.</Text>
            ) : (
              <View style={styles.list}>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.listItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>
                          {item.created_by_name}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.submeta}>
                      {formatDate(item.created_at)}
                    </Text>
                    <Text style={styles.itemBody}>{item.content}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <BottomNav activeRoute="/announcements" />
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
  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
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
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.navy,
    flex: 1,
  },
  chip: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.navy,
  },
  submeta: {
    fontSize: 12,
    color: Colors.gray500,
    marginBottom: 8,
  },
  itemBody: {
    fontSize: 13,
    color: Colors.gray700,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.gray400,
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
});
