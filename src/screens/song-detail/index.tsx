import LyricsView, { LyricsSection } from "@/src/components/LyricsView";
import songsData from "@/src/data/songs.json";
import { useSongFavoritesStore } from "@/src/stores/song-favorites";
import { Song } from "@/src/types/song";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const songs = songsData as Song[];

export default function SongDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const song = songs.find((s) => s.id === Number(id));
  const isFavorite = useSongFavoritesStore((s) => s.ids.has(Number(id)));
  const toggleFavorite = useSongFavoritesStore((s) => s.toggle);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
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
    if (!song) return [];
    const result: LyricsSection[] = [];
    song.verses.forEach((verse, index) => {
      result.push({ content: verse });
      if (song.chorus && index === 0) {
        result.push({ content: song.chorus });
      }
    });
    return result;
  }, [song]);

  if (!song) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Canción no encontrada</Text>
      </View>
    );
  }

  return (
    <LyricsView title={song.title} sections={sections} labelStyle="header" />
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
