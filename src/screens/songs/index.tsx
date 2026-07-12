import SearchIcon from "@/assets/svg/search.svg";
import songsData from "@/src/data/songs.json";
import { useSettingsStore } from "@/src/stores/settings";
import { useSongFavoritesStore } from "@/src/stores/song-favorites";
import { Song } from "@/src/types/song";
import { Ionicons } from "@expo/vector-icons";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const songs = songsData as Song[];

const stripAccents = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function SongsScreen() {
  const [search, setSearch] = useState("");
  const favorites = useSongFavoritesStore((s) => s.ids);
  const toggleFavorite = useSongFavoritesStore((s) => s.toggle);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const { push } = useRouter();
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(insets.top + 150);
  const listRef = useRef<FlashListRef<{ song: Song; snippet: string }>>(null);

  const handleHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  };

  // Changing the query replaces the whole dataset, so any preserved scroll
  // offset would land in a random spot (seen as a blank gap above results).
  const handleSearchChange = (text: string) => {
    setSearch(text);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return songs.map((s) => ({ song: s, snippet: "" }));
    const normQuery = stripAccents(query);

    const titleMatches: { song: Song; snippet: string }[] = [];
    const lyricsMatches: { song: Song; snippet: string }[] = [];

    for (const s of songs) {
      // Match by title
      if (stripAccents(s.title.toLowerCase()).includes(normQuery)) {
        titleMatches.push({ song: s, snippet: "" });
        continue;
      }

      // Match by lyrics
      const allText = [...s.verses, s.chorus ?? ""].join("\n");
      const normText = stripAccents(allText.toLowerCase());
      const idx = normText.indexOf(normQuery);
      if (idx !== -1) {
        const start = allText.lastIndexOf("\n", idx) + 1;
        const end = allText.indexOf("\n", idx + normQuery.length);
        const line = allText.slice(start, end === -1 ? undefined : end).trim();
        lyricsMatches.push({ song: s, snippet: line });
      }
    }

    return [...titleMatches, ...lyricsMatches];
  }, [search]);

  const highlightMatch = (text: string, query: string) => {
    const normText = stripAccents(text.toLowerCase());
    const normQuery = stripAccents(query.toLowerCase());
    const idx = normText.indexOf(normQuery);
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + normQuery.length);
    const after = text.slice(idx + normQuery.length);
    return (
      <>
        {before}
        <Text style={styles.snippetBold}>{match}</Text>
        {after}
      </>
    );
  };

  const renderItem = ({
    item: { song, snippet },
  }: {
    item: { song: Song; snippet: string };
  }) => (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      onPress={() => push(`/song/${song.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Canción ${song.title}`}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.title, { fontSize }]} numberOfLines={1}>
          {song.title}
        </Text>
        {snippet !== "" && (
          <Text style={styles.snippet} numberOfLines={1}>
            &ldquo;...
            {highlightMatch(snippet, search.trim())}
            ...&rdquo;
          </Text>
        )}
      </View>
      <Pressable
        onPress={() => toggleFavorite(song.id)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={
          favorites.has(song.id) ? "Quitar de favoritos" : "Agregar a favoritos"
        }
      >
        <Ionicons
          name={favorites.has(song.id) ? "heart" : "heart-outline"}
          size={20}
          color={favorites.has(song.id) ? "#E05555" : "#CCC"}
        />
      </Pressable>
    </Pressable>
  );

  const listEmptyComponent = (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={40} color="#CCC" />
      <Text style={styles.emptyText}>No se encontraron canciones</Text>
    </View>
  );

  const isSearching = search.trim().length > 0;

  const listFrameStyle = { marginTop: headerHeight };
  const listContentStyle = { paddingBottom: insets.bottom + 50 };

  const renderList = () => (
    <FlashList
      ref={listRef}
      data={results}
      keyExtractor={(item) => item.song.id.toString()}
      renderItem={renderItem}
      drawDistance={300}
      maintainVisibleContentPosition={{ disabled: true }}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      indicatorStyle="black"
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustsScrollIndicatorInsets={false}
      ListEmptyComponent={listEmptyComponent}
      style={listFrameStyle}
      contentContainerStyle={listContentStyle}
    />
  );

  return (
    <View style={styles.container} collapsable={false}>
      {renderList()}

      <View style={styles.headerOverlay} onLayout={handleHeaderLayout}>
        <View style={[styles.headerSection, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.headerTitle}>Canciones</Text>
          <Text style={styles.headerSubtitle}>de Alabanza</Text>
          <View
            style={[
              styles.searchContainer,
              isSearching && styles.searchContainerActive,
            ]}
          >
            <SearchIcon
              width={20}
              height={20}
              stroke={isSearching ? "#FFFFFF" : "#999"}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o letra..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={handleSearchChange}
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="always"
              accessibilityLabel="Buscar canciones"
              accessibilityRole="search"
            />
          </View>
        </View>

        {isSearching && (
          <View style={styles.filterBanner}>
            <Text style={styles.filterText}>
              {results.length} resultado{results.length !== 1 ? "s" : ""} para
              &ldquo;{search.trim()}&rdquo;
            </Text>
            <Pressable
              onPress={() => handleSearchChange("")}
              hitSlop={8}
              accessibilityLabel="Limpiar búsqueda"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={18} color="#888" />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // White (not #FAFAFA) so the empty area below the last row blends with
    // the white list rows instead of showing a gray band above the tab bar.
    backgroundColor: "#FFFFFF",
  },
  headerOverlay: {
    // No zIndex: as the last sibling it already paints on top, and zIndex
    // would force React Native to reorder native subviews, which can move
    // the list out of the subviews[0] slot the native scroll-to-top needs.
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 8,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  searchContainerActive: {
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  filterBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#F0F0F0",
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
  filterText: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    color: "#FFFFFF",
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
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "400",
  },
  snippet: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
    marginTop: 2,
  },
  snippetBold: {
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: "#999",
  },
});
