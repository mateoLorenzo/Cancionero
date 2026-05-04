import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "song-favorites" });

// Storage access is wrapped to stay safe during web SSR (no localStorage)
function loadFavorites(): Set<number> {
  try {
    const raw = storage.getString("ids");
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

function saveFavorites(ids: Set<number>): void {
  try {
    storage.set("ids", JSON.stringify([...ids]));
  } catch {}
}

interface SongFavoritesState {
  ids: Set<number>;
  toggle: (id: number) => void;
}

export const useSongFavoritesStore = create<SongFavoritesState>((set, get) => ({
  ids: loadFavorites(),

  toggle: (id: number) => {
    const next = new Set(get().ids);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    saveFavorites(next);
    set({ ids: next });
  },
}));
