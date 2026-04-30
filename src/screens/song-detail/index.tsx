import LyricsView, { LyricsSection } from "@/src/components/LyricsView";
import songsData from "@/src/data/songs.json";
import { Song } from "@/src/types/song";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

const songs = songsData as Song[];

export default function SongDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const song = songs.find((s) => s.id === Number(id));

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: "" });
  }, [navigation]);

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
});
