import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "settings" });

interface SettingsState {
  fontSize: number;
  setFontSize: (size: number) => void;
}

// Storage access is wrapped to stay safe during web SSR (no localStorage)
function readFontSize(): number {
  try {
    return storage.getNumber("fontSize") ?? 18;
  } catch {
    return 18;
  }
}

function writeFontSize(size: number): void {
  try {
    storage.set("fontSize", size);
  } catch {}
}

export const useSettingsStore = create<SettingsState>((set) => ({
  fontSize: readFontSize(),

  setFontSize: (size: number) => {
    writeFontSize(size);
    set({ fontSize: size });
  },
}));
