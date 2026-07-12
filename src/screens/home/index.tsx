import SearchIcon from "@/assets/svg/search.svg";
import hymnsData from "@/src/data/hymns.json";
import { useFavoritesStore } from "@/src/stores/favorites";
import { useSettingsStore } from "@/src/stores/settings";
import { Hymn } from "@/src/types/hymn";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const hymns = hymnsData as Hymn[];

const stripAccents = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const favorites = useFavoritesStore((s) => s.ids);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const { push } = useRouter();
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(insets.top + 150);

  const handleHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  };

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return hymns.map((h) => ({ hymn: h, snippet: "" }));
    const queryNum = parseInt(query, 10);
    const normQuery = stripAccents(query);

    const titleMatches: { hymn: Hymn; snippet: string }[] = [];
    const lyricsMatches: { hymn: Hymn; snippet: string }[] = [];

    for (const h of hymns) {
      // Match by number
      if (!isNaN(queryNum) && String(h.id).includes(query)) {
        titleMatches.push({ hymn: h, snippet: "" });
        continue;
      }

      // Match by title
      if (stripAccents(h.title.toLowerCase()).includes(normQuery)) {
        titleMatches.push({ hymn: h, snippet: "" });
        continue;
      }

      // Match by lyrics
      const allText = [...h.verses, h.chorus ?? ""].join("\n");
      const normText = stripAccents(allText.toLowerCase());
      const idx = normText.indexOf(normQuery);
      if (idx !== -1) {
        // Extract a snippet around the match
        const start = allText.lastIndexOf("\n", idx) + 1;
        const end = allText.indexOf("\n", idx + normQuery.length);
        const line = allText.slice(start, end === -1 ? undefined : end).trim();
        lyricsMatches.push({ hymn: h, snippet: line });
      }
    }

    return [...titleMatches, ...lyricsMatches];
  }, [search]);

  const handlePress = (id: number) => {
    push(`/hymn/${id}`);
  };

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

  const renderItem = ({ item: { hymn, snippet } }: { item: { hymn: Hymn; snippet: string } }) => (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        pressed && styles.itemPressed,
      ]}
      onPress={() => handlePress(hymn.id)}
      accessibilityRole="button"
      accessibilityLabel={`Himno ${hymn.id}, ${hymn.title}`}
    >
      <Text style={styles.number}>#{hymn.id}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { fontSize }]} numberOfLines={1}>
          {hymn.title}
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
        onPress={() => toggleFavorite(hymn.id)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={
          favorites.has(hymn.id)
            ? "Quitar de favoritos"
            : "Agregar a favoritos"
        }
      >
        <Ionicons
          name={favorites.has(hymn.id) ? "heart" : "heart-outline"}
          size={20}
          color={favorites.has(hymn.id) ? "#E05555" : "#CCC"}
        />
      </Pressable>
    </Pressable>
  );

  const listEmptyComponent = (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={40} color="#CCC" />
      <Text style={styles.emptyText}>No se encontraron himnos</Text>
    </View>
  );

  const isSearching = search.trim().length > 0;

  const listFrameStyle = { marginTop: headerHeight };
  const listContentStyle = { paddingBottom: insets.bottom + 50};

  const renderList = () => (
    <FlashList
      data={results}
      keyExtractor={(item) => item.hymn.id.toString()}
      renderItem={renderItem}
      drawDistance={300}
      keyboardDismissMode="on-drag"
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
          <Text style={styles.headerTitle}>Himnos y Canticos</Text>
          <Text style={styles.headerSubtitle}>del Evangelio</Text>
          <View
            style={[
              styles.searchContainer,
              isSearching && styles.searchContainerActive,
            ]}
          >
            <SearchIcon width={20} height={20} stroke={isSearching ? "#FFFFFF" : "#999"} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, número o letra..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="always"
              accessibilityLabel="Buscar himnos"
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
  number: {
    fontSize: 14,
    color: "#999",
    width: 46,
    fontWeight: "400",
    fontVariant: ["tabular-nums"],
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
