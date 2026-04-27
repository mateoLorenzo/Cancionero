import ZoomInIcon from "@/assets/svg/zoom-in.svg";
import ZoomOutIcon from "@/assets/svg/zoom-out.svg";
import hymnsData from "@/src/data/hymns.json";
import { useSettingsStore } from "@/src/stores/settings";
import { Hymn } from "@/src/types/hymn";
import { haptics } from "@/src/utils/haptic-feedback";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useLayoutEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const hymns = hymnsData as Hymn[];

const MIN_FONT = 14;
const MAX_FONT = 28;

export default function HymnDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const fontSize = useSettingsStore((s) => s.fontSize);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const hymn = hymns.find((h) => h.id === Number(id));

  const decreaseFont = () => {
    if (fontSize > MIN_FONT) {
      haptics.light();
      setFontSize(fontSize - 1);
    }
  };

  const increaseFont = () => {
    if (fontSize < MAX_FONT) {
      haptics.light();
      setFontSize(fontSize + 1);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: `#${id}` });
  }, [navigation, id]);

  const capitalizeLines = (text: string) =>
    text.replace(/(^|\n)(.)/g, (_, sep, char) => sep + char.toUpperCase());

  if (!hymn) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Himno no encontrado</Text>
      </View>
    );
  }

  const textStyle = {
    fontFamily: "Lato-Regular",
    fontSize,
    lineHeight: fontSize * 1.5,
    letterSpacing: -0.3,
    color: "#111111",
  };

  return (
    <>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{hymn.title}</Text>
        <View style={styles.separator} />

        {hymn.verses.map((verse, index) => (
          <View key={index}>
            <Text style={[styles.verse, textStyle]}>
              {capitalizeLines(verse)}
            </Text>

            {hymn.chorus && index === 0 && (
              <Text style={[styles.verse, textStyle]}>
                <Text style={styles.chorusLabel}>Coro:{"\n"}</Text>
                {capitalizeLines(hymn.chorus)}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.floatingButtons}>
        <Pressable
          style={[
            styles.fontButton,
            fontSize <= MIN_FONT && styles.fontButtonDisabled,
          ]}
          onPress={decreaseFont}
          disabled={fontSize <= MIN_FONT}
          hitSlop={16}
          accessibilityLabel="Disminuir tamaño de fuente"
          accessibilityRole="button"
        >
          <ZoomOutIcon
            width={32}
            height={32}
            stroke={fontSize <= MIN_FONT ? "#CCC" : "#1A1A1A"}
          />
        </Pressable>

        <Pressable
          style={[
            styles.fontButton,
            fontSize >= MAX_FONT && styles.fontButtonDisabled,
          ]}
          onPress={increaseFont}
          disabled={fontSize >= MAX_FONT}
          hitSlop={16}
          accessibilityLabel="Aumentar tamaño de fuente"
          accessibilityRole="button"
        >
          <ZoomInIcon
            width={32}
            height={32}
            stroke={fontSize >= MAX_FONT ? "#CCC" : "#1A1A1A"}
          />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    lineHeight: 32,
  },
  separator: {
    height: 3,
    backgroundColor: "#1A1A1A",
    marginTop: 8,
    marginBottom: 32,
    alignSelf: "stretch",
  },
  verse: {
    marginBottom: 32,
  },
  chorusLabel: {
    fontFamily: "Lato-Bold",
  },
  notFound: {
    textAlign: "center",
    marginTop: 48,
    fontSize: 16,
    color: "#999",
  },
  floatingButtons: {
    position: "absolute",
    bottom: 32,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    pointerEvents: "box-none",
  },
  fontButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  fontButtonDisabled: {
    opacity: 0.4,
  },
});
