import {
  Lato_400Regular,
  Lato_700Bold,
  useFonts,
} from "@expo-google-fonts/lato";
import { PlayfairDisplay_400Regular_Italic } from "@expo-google-fonts/playfair-display";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Lato-Regular": Lato_400Regular,
    "Lato-Bold": Lato_700Bold,
    "PlayfairDisplay-Italic": PlayfairDisplay_400Regular_Italic,
  });

  // Hide splash after first paint to avoid the white flash gap
  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: styles.screenContent,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="hymn/[id]"
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Atrás",
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="song/[id]"
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Atrás",
            headerShadowVisible: false,
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  screenContent: {
    backgroundColor: "#000000",
  },
});
