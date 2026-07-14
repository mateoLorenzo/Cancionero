import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { StyleSheet } from "react-native";

export default function TabsLayout() {
  if (process.env.EXPO_OS === "ios") {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <Label>Himnos</Label>
          <Icon sf={"book"} drawable="custom_home_drawable" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="songs">
          <Label>Canciones</Label>
          <Icon sf={"music.pages"} drawable="custom_home_drawable" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="favorites">
          <Label>Favoritos</Label>
          <Icon sf={"heart"} drawable="custom_home_drawable" />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1A1A1A",
        tabBarInactiveTintColor: "#999999",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Himnos",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="songs"
        options={{
          title: "Canciones",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "musical-notes" : "musical-notes-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoritos",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5E5",
    elevation: 0,
  },
  tabBarLabel: {
    fontFamily: "Lato-Regular",
    fontSize: 11,
  },
});
