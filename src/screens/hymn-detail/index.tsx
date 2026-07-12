import LyricsView, { LyricsSection } from "@/src/components/LyricsView";
import hymnsData from "@/src/data/hymns.json";
import { useFavoritesStore } from "@/src/stores/favorites";
import { Hymn } from "@/src/types/hymn";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const hymns = hymnsData as Hymn[];

export default function HymnDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const hymn = hymns.find((h) => h.id === Number(id));
  const isFavorite = useFavoritesStore((s) => s.ids.has(Number(id)));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: `#${id}`,
      headerRight: () => (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(Number(id))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
          }
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#E05555" : "#999"}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, id, isFavorite, toggleFavorite]);

  const sections = useMemo<LyricsSection[]>(() => {
    if (!hymn) return [];
    const result: LyricsSection[] = [];
    hymn.verses.forEach((verse, index) => {
      result.push({ content: verse });
      if (hymn.chorus && index === 0) {
        result.push({ label: "Coro:", content: hymn.chorus });
      }
    });
    return result;
  }, [hymn]);

  if (!hymn) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Himno no encontrado</Text>
      </View>
    );
  }

  return (
    <LyricsView title={hymn.title} sections={sections} labelStyle="inline" />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  notFound: {
    textAlign: "center",
    marginTop: 48,
    fontSize: 16,
    color: "#999",
  },
  // Fixed square so the icon glyph centers inside the native header circle
  favoriteButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
});
