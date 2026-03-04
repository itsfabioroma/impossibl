import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";

const TRANSCRIPTS_DIR = path.join(process.cwd(), "data/transcripts");
const OUTPUT_PATH = path.join(process.cwd(), "data/embeddings.json");
const CHUNK_SIZE = 500; // words
const OVERLAP = 50; // words

// metadata shape (partial — only fields we use)
interface EpisodeMeta {
  title?: string;
  date?: string;
  source?: { channel?: string; description?: string };
  theme?: { primaryTheme?: string; summary?: string };
}

// split text into overlapping word-based chunks
function chunkText(text: string, size: number, overlap: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += size - overlap) {
    const chunk = words.slice(i, i + size).join(" ");
    if (chunk.trim()) chunks.push(chunk);
    if (i + size >= words.length) break;
  }

  return chunks;
}

// build a short header from metadata to prepend to each chunk
function buildMetaHeader(meta: EpisodeMeta): string {
  const parts: string[] = [];
  if (meta.title) parts.push(`Episode: ${meta.title}`);
  if (meta.date) parts.push(`Date: ${meta.date}`);
  if (meta.theme?.primaryTheme) parts.push(`Theme: ${meta.theme.primaryTheme}`);
  if (meta.theme?.summary) parts.push(`Summary: ${meta.theme.summary}`);
  return parts.length > 0 ? parts.join("\n") + "\n\n" : "";
}

// discover episodes: each subfolder has transcript.txt + metadata.json
function discoverEpisodes(): { dir: string; name: string }[] {
  return fs
    .readdirSync(TRANSCRIPTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) =>
      fs.existsSync(path.join(TRANSCRIPTS_DIR, d.name, "transcript.txt"))
    )
    .map((d) => ({ dir: path.join(TRANSCRIPTS_DIR, d.name), name: d.name }));
}

// load metadata.json from episode folder
function loadMeta(episodeDir: string): EpisodeMeta | null {
  const metaPath = path.join(episodeDir, "metadata.json");
  if (!fs.existsSync(metaPath)) return null;
  return JSON.parse(fs.readFileSync(metaPath, "utf-8"));
}

async function main() {
  // find all episode folders
  const episodes = discoverEpisodes();

  if (episodes.length === 0) {
    console.log("No episodes found. Expected: data/transcripts/<episode>/transcript.txt");
    process.exit(1);
  }

  console.log(`Found ${episodes.length} episode(s)`);

  // chunk all episodes, prepend metadata header to each chunk
  const allChunks: { text: string; source: string; index: number }[] = [];

  for (const ep of episodes) {
    const content = fs.readFileSync(path.join(ep.dir, "transcript.txt"), "utf-8");
    const meta = loadMeta(ep.dir);
    const header = meta ? buildMetaHeader(meta) : "";
    const chunks = chunkText(content, CHUNK_SIZE, OVERLAP);

    console.log(`  ${ep.name}: ${chunks.length} chunks${meta ? " (+ metadata)" : ""}`);

    chunks.forEach((text, index) => {
      allChunks.push({ text: header + text, source: ep.name, index });
    });
  }

  console.log(`\nEmbedding ${allChunks.length} chunks...`);

  // embed in batches of 100 (API limit)
  const BATCH_SIZE = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: batch.map((c) => c.text),
    });
    allEmbeddings.push(...embeddings);
    console.log(
      `  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allChunks.length / BATCH_SIZE)} done`
    );
  }

  // save to JSON
  const output = {
    chunks: allChunks.map((chunk, i) => ({
      ...chunk,
      embedding: allEmbeddings[i],
    })),
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output));
  console.log(`\nSaved ${output.chunks.length} embeddings to data/embeddings.json`);
}

main().catch(console.error);
