// import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
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
