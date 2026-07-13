import SearchIcon from "@/assets/svg/search.svg";
import hymnsData from "@/src/data/hymns.json";
import songsData from "@/src/data/songs.json";
import { useFavoritesStore } from "@/src/stores/favorites";
import { useSettingsStore } from "@/src/stores/settings";
import { Hymn } from "@/src/types/hymn";
import { Song } from "@/src/types/song";
import { searchCollection, stripAccents } from "@/src/utils/search";
import { Ionicons } from "@expo/vector-icons";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Keyboard,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const hymns = hymnsData as Hymn[];
const songs = songsData as Song[];

type ListItem =
  | { type: "hymn"; hymn: Hymn; snippet: string }
  | { type: "crossHeader" }
  | { type: "song"; song: Song; snippet: string };

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const favorites = useFavoritesStore((s) => s.ids);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const { push } = useRouter();
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(insets.top + 150);
  const listRef = useRef<FlashListRef<ListItem>>(null);

  const handleHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  };

  // Changing the query replaces the whole dataset, so any preserved scroll
  // offset would land in a random spot (seen as a blank gap above results).
  const handleSearchChange = (text: string) => {
    setSearch(text);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const results = useMemo(
    () => searchCollection(hymns, search, { matchNumber: true }),
    [search],
  );

  // Matches from the other collection, shown as a "did you mean" section
  const crossResults = useMemo(
    () => (search.trim() ? searchCollection(songs, search) : []),
    [search],
  );

  const data = useMemo<ListItem[]>(() => {
    const items: ListItem[] = results.map(({ item, snippet }) => ({
      type: "hymn",
      hymn: item,
      snippet,
    }));
    if (crossResults.length > 0) {
      items.push({ type: "crossHeader" });
      crossResults.forEach(({ item, snippet }) =>
        items.push({ type: "song", song: item, snippet }),
      );
    }
    return items;
  }, [results, crossResults]);

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

  const renderSnippet = (snippet: string) =>
    snippet !== "" && (
      <Text style={styles.snippet} numberOfLines={1}>
        &ldquo;...
        {highlightMatch(snippet, search.trim())}
        ...&rdquo;
      </Text>
    );

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "crossHeader") {
      return (
        <View style={styles.crossHeader}>
          <Text style={styles.crossHeaderTitle}>
            Tal vez querías decir&hellip;
          </Text>
          <Text style={styles.crossHeaderSubtitle}>
            Resultados en Canciones
          </Text>
        </View>
      );
    }

    if (item.type === "song") {
      return (
        <Pressable
          style={({ pressed }) => [
            styles.item,
            styles.crossItem,
            pressed && styles.crossItemPressed,
          ]}
          onPress={() => push(`/song/${item.song.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`Canción ${item.song.title}`}
        >
          <View style={styles.textContainer}>
            <Text style={[styles.title, { fontSize }]} numberOfLines={1}>
              {item.song.title}
            </Text>
            {renderSnippet(item.snippet)}
          </View>
          <Ionicons name="chevron-forward" size={16} color="#CCC" />
        </Pressable>
      );
    }

    const { hymn, snippet } = item;
    return (
      <Pressable
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        onPress={() => push(`/hymn/${hymn.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`Himno ${hymn.id}, ${hymn.title}`}
      >
        <Text style={styles.number}>#{hymn.id}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { fontSize }]} numberOfLines={1}>
            {hymn.title}
          </Text>
          {renderSnippet(snippet)}
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
  };

  const listEmptyComponent = (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={40} color="#CCC" />
      <Text style={styles.emptyText}>No se encontraron himnos</Text>
    </View>
  );

  const isSearching = search.trim().length > 0;

  const listFrameStyle = { marginTop: headerHeight };
  const listContentStyle = { paddingBottom: insets.bottom + 50 };

  const renderList = () => (
    <FlashList
      ref={listRef}
      data={data}
      keyExtractor={(item) =>
        item.type === "crossHeader"
          ? "cross-header"
          : item.type === "song"
            ? `song-${item.song.id}`
            : `hymn-${item.hymn.id}`
      }
      getItemType={(item) => item.type}
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

      {/* Tapping the header (outside the input) closes the keyboard */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              <SearchIcon
                width={20}
                height={20}
                stroke={isSearching ? "#FFFFFF" : "#999"}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre, número o letra..."
                placeholderTextColor="#999"
                value={search}
                onChangeText={handleSearchChange}
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
      </TouchableWithoutFeedback>
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
  // The cross-section zone uses a grouped gray treatment (banner header plus
  // tinted rows) so the boundary with the main results reads at a glance
  crossHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#F0F0F0",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#CCC",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#CCC",
  },
  crossHeaderTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  crossHeaderSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 1,
  },
  crossItem: {
    backgroundColor: "#FAFAFA",
    borderBottomColor: "#E5E5E5",
  },
  crossItemPressed: {
    backgroundColor: "#EFEFEF",
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
