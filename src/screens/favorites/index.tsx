import hymnsData from "@/src/data/hymns.json";
import { useFavoritesStore } from "@/src/stores/favorites";
import { useSettingsStore } from "@/src/stores/settings";
import { Hymn } from "@/src/types/hymn";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FEEDBACK_URL =
  "https://wa.me/5491140392404?text=Hola,%20tengo%20una%20sugerencia%20para%20la%20app%20Cancionero";

const hymns = hymnsData as Hymn[];

export default function FavoritesScreen() {
  const { push } = useRouter();
  const insets = useSafeAreaInsets();
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const fontSize = useSettingsStore((s) => s.fontSize);

  const favorites = useMemo(
    () => hymns.filter((h) => favoriteIds.has(h.id)),
    [favoriteIds],
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.headerSection, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Mis Favoritos</Text>
        <Text style={styles.headerSubtitle}>Guarda tantos como quieras</Text>
      </View>

      <View style={styles.listWrapper}>
        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>
              Aún no tenés himnos favoritos
            </Text>
            <Text style={styles.emptySubtext}>
              Tocá el corazón en un himno para guardarlo acá
            </Text>
          </View>
        ) : (
          <FlashList
            data={favorites}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.item,
                  pressed && styles.itemPressed,
                ]}
                onPress={() => push(`/hymn/${item.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Himno ${item.id}, ${item.title}`}
              >
                <Text style={styles.number}>#{item.id}</Text>
                <Text style={[styles.title, { fontSize }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Pressable
                  onPress={() => toggleFavorite(item.id)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Quitar de favoritos"
                >
                  <Ionicons name="heart" size={20} color="#E05555" />
                </Pressable>
              </Pressable>
            )}
            keyboardDismissMode="on-drag"
          />
        )}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.feedbackButton,
            pressed && styles.feedbackButtonPressed,
          ]}
          onPress={() => Linking.openURL(FEEDBACK_URL)}
          accessibilityRole="button"
          accessibilityLabel="Enviar sugerencia por WhatsApp"
        >
          <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
          <Text style={styles.feedbackButtonText}>Enviar sugerencias</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  headerSection: {
    backgroundColor: "#0c0c0c",
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "PlayfairDisplay-Italic",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay-Italic",
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECECEC",
  },
  itemPressed: {
    backgroundColor: "#F5F5F5",
  },
  number: {
    fontSize: 15,
    color: "#AAAAAA",
    width: 46,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  title: {
    color: "#1A1A1A",
    flex: 1,
    fontWeight: "400",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#999",
    marginTop: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#BBB",
    textAlign: "center",
  },
  listWrapper: {
    flex: 1,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: "#FAFAFA",
  },
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#179130",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  feedbackButtonPressed: {
    opacity: 0.8,
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
