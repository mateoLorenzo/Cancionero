import hymnsData from "@/src/data/hymns.json";
import songsData from "@/src/data/songs.json";
import { useFavoritesStore } from "@/src/stores/favorites";
import { useSettingsStore } from "@/src/stores/settings";
import { useSongFavoritesStore } from "@/src/stores/song-favorites";
import { Hymn } from "@/src/types/hymn";
import { Song } from "@/src/types/song";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FEEDBACK_URL =
  "https://wa.me/5491140392404?text=Hola,%20tengo%20una%20sugerencia%20para%20la%20app%20Cancionero";

const hymns = hymnsData as Hymn[];
const songs = songsData as Song[];

type FavItem =
  | { type: "header"; key: string; label: string }
  | { type: "hymn"; key: string; hymn: Hymn }
  | { type: "song"; key: string; song: Song };

export default function FavoritesScreen() {
  const { push } = useRouter();
  const insets = useSafeAreaInsets();
  const hymnFavoriteIds = useFavoritesStore((s) => s.ids);
  const toggleHymnFavorite = useFavoritesStore((s) => s.toggle);
  const songFavoriteIds = useSongFavoritesStore((s) => s.ids);
  const toggleSongFavorite = useSongFavoritesStore((s) => s.toggle);
  const fontSize = useSettingsStore((s) => s.fontSize);
  // The list must be the first descendant for the native tab bar's
  // scroll-to-top (repeated tab selection) to work, so the header is
  // overlaid on top and the list is padded down by its measured height.
  const [headerHeight, setHeaderHeight] = useState(insets.top + 90);

  const handleHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  };

  const favoriteHymns = useMemo(
    () => hymns.filter((h) => hymnFavoriteIds.has(h.id)),
    [hymnFavoriteIds],
  );

  const favoriteSongs = useMemo(
    () => songs.filter((s) => songFavoriteIds.has(s.id)),
    [songFavoriteIds],
  );

  const data = useMemo<FavItem[]>(() => {
    const items: FavItem[] = [];
    if (favoriteHymns.length > 0) {
      items.push({ type: "header", key: "h-header", label: "Himnos" });
      favoriteHymns.forEach((h) =>
        items.push({ type: "hymn", key: `h-${h.id}`, hymn: h }),
      );
    }
    if (favoriteSongs.length > 0) {
      items.push({ type: "header", key: "s-header", label: "Canciones" });
      favoriteSongs.forEach((s) =>
        items.push({ type: "song", key: `s-${s.id}`, song: s }),
      );
    }
    return items;
  }, [favoriteHymns, favoriteSongs]);

  const isEmpty = data.length === 0;

  const renderItem = ({ item }: { item: FavItem }) => {
    if (item.type === "header") {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{item.label}</Text>
        </View>
      );
    }

    if (item.type === "hymn") {
      const h = item.hymn;
      return (
        <Pressable
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          onPress={() => push(`/hymn/${h.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`Himno ${h.id}, ${h.title}`}
        >
          <Text style={styles.number}>#{h.id}</Text>
          <Text style={[styles.title, { fontSize }]} numberOfLines={1}>
            {h.title}
          </Text>
          <Pressable
            onPress={() => toggleHymnFavorite(h.id)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Quitar de favoritos"
          >
            <Ionicons name="heart" size={20} color="#E05555" />
          </Pressable>
        </Pressable>
      );
    }

    const s = item.song;
    return (
      <Pressable
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        onPress={() => push(`/song/${s.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`Canción ${s.title}`}
      >
        <Text
          style={[styles.title, styles.titleNoNumber, { fontSize }]}
          numberOfLines={1}
        >
          {s.title}
        </Text>
        <Pressable
          onPress={() => toggleSongFavorite(s.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Quitar de favoritos"
        >
          <Ionicons name="heart" size={20} color="#E05555" />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={styles.container} collapsable={false}>
      <StatusBar style="light" />

      <View style={styles.listWrapper} collapsable={false}>
        {isEmpty ? (
          <View style={[styles.emptyContainer, { paddingTop: headerHeight }]}>
            <Ionicons name="heart-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Aún no tenés favoritos</Text>
            <Text style={styles.emptySubtext}>
              Tocá el corazón en un himno o canción para guardarlo acá
            </Text>
          </View>
        ) : (
          <FlashList
            data={data}
            keyExtractor={(item) => item.key}
            getItemType={(item) => item.type}
            indicatorStyle="black"
            renderItem={renderItem}
            keyboardDismissMode="on-drag"
            contentInsetAdjustmentBehavior="never"
            automaticallyAdjustsScrollIndicatorInsets={false}
            style={{ marginTop: headerHeight }}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 62 }]}>
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

      <View style={styles.headerOverlay} onLayout={handleHeaderLayout}>
        <View style={[styles.headerSection, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.headerTitle}>Mis Favoritos</Text>
          <Text style={styles.headerSubtitle}>Guarda tantos como quieras</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: "#FAFAFA",
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#515151",
    textTransform: "uppercase",
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
  titleNoNumber: {
    marginLeft: 0,
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
    paddingHorizontal: 20,
    backgroundColor: "#FAFAFA",
  },
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#179130",
    borderRadius: 100,
    paddingVertical: 16,
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
