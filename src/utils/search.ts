export interface Searchable {
  id: number;
  title: string;
  verses: string[];
  chorus?: string;
}

export interface SearchMatch<T> {
  item: T;
  snippet: string;
}

export const stripAccents = (str: string): string =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function searchCollection<T extends Searchable>(
  items: T[],
  query: string,
  options: { matchNumber?: boolean } = {},
): SearchMatch<T>[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return items.map((item) => ({ item, snippet: "" }));

  const normQuery = stripAccents(trimmed);
  const queryNum = parseInt(trimmed, 10);

  const titleMatches: SearchMatch<T>[] = [];
  const lyricsMatches: SearchMatch<T>[] = [];

  for (const item of items) {
    if (
      options.matchNumber &&
      !isNaN(queryNum) &&
      String(item.id).includes(trimmed)
    ) {
      titleMatches.push({ item, snippet: "" });
      continue;
    }

    if (stripAccents(item.title.toLowerCase()).includes(normQuery)) {
      titleMatches.push({ item, snippet: "" });
      continue;
    }

    const allText = [...item.verses, item.chorus ?? ""].join("\n");
    const normText = stripAccents(allText.toLowerCase());
    const idx = normText.indexOf(normQuery);
    if (idx !== -1) {
      const start = allText.lastIndexOf("\n", idx) + 1;
      const end = allText.indexOf("\n", idx + normQuery.length);
      const line = allText.slice(start, end === -1 ? undefined : end).trim();
      lyricsMatches.push({ item, snippet: line });
    }
  }

  return [...titleMatches, ...lyricsMatches];
}
