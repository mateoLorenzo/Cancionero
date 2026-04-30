const fs = require('fs');
const path = require('path');

const SONGS_DIR = path.join(__dirname, '..', 'src', 'data', 'canciones - letras');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'songs.json');

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseXML(xmlContent) {
  const titleMatch = xmlContent.match(/<title[^>]*>([^<]+)<\/title>/);
  const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : null;
  if (!title) return null;

  const authorMatch = xmlContent.match(/<author[^>]*>([^<]+)<\/author>/);
  const author = authorMatch ? decodeEntities(authorMatch[1].trim()) : null;

  const verseRegex = /<verse name="([^"]+)">\s*<lines>([\s\S]*?)<\/lines>\s*<\/verse>/g;
  const verses = [];
  const choruses = [];
  let match;

  while ((match = verseRegex.exec(xmlContent)) !== null) {
    const verseName = match[1];
    const verseLines = decodeEntities(
      match[2].replace(/<br\s*\/?>/gi, '\n').trim()
    );

    if (verseName.startsWith('c')) {
      choruses.push(verseLines);
    } else {
      verses.push(verseLines);
    }
  }

  const result = { title, verses };

  if (choruses.length > 0) {
    result.chorus = choruses.join('\n\n');
  }

  if (author && author.toLowerCase() !== 'author unknown') {
    result.author = author;
  }

  return result;
}

const files = fs
  .readdirSync(SONGS_DIR)
  .filter((f) => f.endsWith('.xml'))
  .sort();

const songs = [];
const errors = [];
let id = 1;

for (const file of files) {
  try {
    const filePath = path.join(SONGS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseXML(content);

    if (!parsed || parsed.verses.length === 0) {
      errors.push({ file, reason: 'no title or verses' });
      continue;
    }

    songs.push({ id: id++, ...parsed });
  } catch (err) {
    errors.push({ file, reason: err.message });
  }
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(songs, null, 2));

console.log(`✅ Parsed ${songs.length}/${files.length} songs`);
console.log(`📄 Output: ${OUTPUT_FILE}`);
console.log(
  `📊 With chorus: ${songs.filter((s) => s.chorus).length}, with author: ${songs.filter((s) => s.author).length}`
);

if (errors.length) {
  console.log(`\n⚠️  ${errors.length} errors:`);
  errors.forEach((e) => console.log(`  - ${e.file}: ${e.reason}`));
}
