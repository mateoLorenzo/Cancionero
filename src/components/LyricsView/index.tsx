import ZoomInIcon from "@/assets/svg/zoom-in.svg";
import ZoomOutIcon from "@/assets/svg/zoom-out.svg";
import { useSettingsStore } from "@/src/stores/settings";
import { haptics } from "@/src/utils/haptic-feedback";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MIN_FONT = 14;
const MAX_FONT = 28;

export interface LyricsSection {
  label?: string;
  content: string;
}

interface LyricsViewProps {
  title: string;
  sections: LyricsSection[];
  labelStyle?: "header" | "inline";
}

const capitalizeLines = (text: string) =>
  text.replace(/(^|\n)(.)/g, (_, sep, char) => sep + char.toUpperCase());

export default function LyricsView({
  title,
  sections,
  labelStyle = "header",
}: LyricsViewProps) {
  const insets = useSafeAreaInsets();
  const fontSize = useSettingsStore((s) => s.fontSize);
  const setFontSize = useSettingsStore((s) => s.setFontSize);

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
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 120 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{title}</Text>
        <View style={styles.separator} />

        {sections.map((section, index) => {
          if (labelStyle === "inline") {
            return (
              <Text key={index} style={[styles.section, textStyle]}>
                {section.label && (
                  <Text style={styles.label}>{section.label}{"\n"}</Text>
                )}
                {capitalizeLines(section.content)}
              </Text>
            );
          }

          return (
            <View key={index} style={styles.sectionBlock}>
              {section.label && (
                <Text style={[textStyle, styles.label]}>{section.label}</Text>
              )}
              <Text style={textStyle}>{capitalizeLines(section.content)}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.floatingButtons,
          { bottom: 16 + insets.bottom },
        ]}
      >
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
  section: {
    marginBottom: 32,
  },
  sectionBlock: {
    marginBottom: 32,
  },
  label: {
    fontFamily: "Lato-Bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  floatingButtons: {
    position: "absolute",
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
