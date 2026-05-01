import SearchIcon from "@/assets/svg/search.svg";
import songsData from "@/src/data/songs.json";
import { useSettingsStore } from "@/src/stores/settings";
import { useSongFavoritesStore } from "@/src/stores/song-favorites";
import { Song } from "@/src/types/song";
import { Ionicons } from "@expo/vector-icons";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
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
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const flashListRef = useRef<FlashListRef<{ song: Song; snippet: string }>>(null);
  const flatListRef = useRef<FlatList<{ song: Song; snippet: string }>>(null);

  useEffect(() => {
    const unsubscribe = (navigation as { addListener: (e: string, cb: () => void) => () => void })
      .addListener("tabPress", () => {
        if (navigation.isFocused()) {
          flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
      });
    return unsubscribe;
  }, [navigation]);

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
      style={({ pressed }) => [
        styles.item,
        pressed && styles.itemPressed,
      ]}
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
          favorites.has(song.id)
            ? "Quitar de favoritos"
            : "Agregar a favoritos"
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

  const renderList = () =>
    isSearching ? (
      <FlatList
        ref={flatListRef}
        data={results}
        keyExtractor={(item) => item.song.id.toString()}
        renderItem={renderItem}
        keyboardDismissMode="on-drag"
        indicatorStyle="black"
        ListEmptyComponent={listEmptyComponent}
      />
    ) : (
      <FlashList
        ref={flashListRef}
        data={results}
        keyExtractor={(item) => item.song.id.toString()}
        renderItem={renderItem}
        drawDistance={300}
        keyboardDismissMode="on-drag"
        indicatorStyle="black"
        ListEmptyComponent={listEmptyComponent}
      />
    );

  return (
    <View style={styles.container}>
      <View style={[styles.headerSection, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Canciones</Text>
        <Text style={styles.headerSubtitle}>de Alabanza</Text>
        <View
          style={[
            styles.searchContainer,
            isSearching && styles.searchContainerActive,
          ]}
        >
          <SearchIcon width={20} height={20} stroke={isSearching ? "#FFFFFF" : "#999"} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o letra..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
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
            {results.length} resultado{results.length !== 1 ? "s" : ""} para &ldquo;{search.trim()}&rdquo;
          </Text>
          <Pressable
            onPress={() => setSearch("")}
            hitSlop={8}
            accessibilityLabel="Limpiar búsqueda"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle" size={18} color="#888" />
          </Pressable>
        </View>
      )}

      {renderList()}
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
