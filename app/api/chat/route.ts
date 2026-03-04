import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { streamText, embed, cosineSimilarity, UIMessage, convertToModelMessages } from 'ai';
import fs from 'fs';
import path from 'path';

export const maxDuration = 30;

// embeddings cache (loaded once per cold start)
let embeddingsCache: {
    chunks: { text: string; source: string; index: number; embedding: number[] }[];
} | null = null;

function loadEmbeddings() {
    if (embeddingsCache) return embeddingsCache;

    const filePath = path.join(process.cwd(), 'data/embeddings.json');
    if (!fs.existsSync(filePath)) return null;

    embeddingsCache = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return embeddingsCache;
}

// episode metadata shape
interface EpisodeMeta {
    title?: string;
    date?: string;
    source?: { duration_string?: string; description?: string };
    theme?: { primaryTheme?: string; summary?: string };
}

// load all episode metadata from data/transcripts/*/metadata.json
let metadataCache: EpisodeMeta[] | null = null;

function loadAllMetadata(): EpisodeMeta[] {
    if (metadataCache) return metadataCache;

    const transcriptsDir = path.join(process.cwd(), 'data/transcripts');
    if (!fs.existsSync(transcriptsDir)) return [];

    metadataCache = fs
        .readdirSync(transcriptsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => {
            const metaPath = path.join(transcriptsDir, d.name, 'metadata.json');
            if (!fs.existsSync(metaPath)) return null;
            return JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as EpisodeMeta;
        })
        .filter((m): m is EpisodeMeta => m !== null);

    return metadataCache;
}

// build rich episode catalog for system prompt
function buildEpisodeCatalog(): string {
    const episodes = loadAllMetadata();
    if (episodes.length === 0) return '';

    const entries = episodes.map((ep) => {
        const lines = [`## ${ep.title || 'Unknown'}`];
        if (ep.date) lines.push(`Date: ${ep.date}`);
        if (ep.source?.duration_string) lines.push(`Duration: ${ep.source.duration_string}`);
        if (ep.theme?.primaryTheme) lines.push(`Theme: ${ep.theme.primaryTheme}`);
        if (ep.theme?.summary) lines.push(`Summary: ${ep.theme.summary}`);
        if (ep.source?.description) {
            // first 500 chars of description for key topics
            const desc = ep.source.description.slice(0, 500);
            lines.push(`Description: ${desc}`);
        }
        return lines.join('\n');
    });

    return `\n\n# EPISODE CATALOG (${episodes.length} episodes)\n\n${entries.join('\n\n')}`;
}

const TRANSCRIPTS_DIR = path.join(process.cwd(), 'data/transcripts');

// load full transcript for an episode
function loadFullTranscript(source: string): string | null {
    const txtPath = path.join(TRANSCRIPTS_DIR, source, 'transcript.txt');
    if (!fs.existsSync(txtPath)) return null;
    return fs.readFileSync(txtPath, 'utf-8');
}

// retrieve context: if query targets one episode, load full transcript + supporting chunks from others
async function retrieveContext(query: string): Promise<string> {
    const db = loadEmbeddings();
    if (!db || db.chunks.length === 0) return '';

    const { embedding } = await embed({
        model: openai.embedding('text-embedding-3-small'),
        value: query,
    });

    const ranked = db.chunks
        .map((chunk) => ({
            ...chunk,
            similarity: cosineSimilarity(embedding, chunk.embedding),
        }))
        .sort((a, b) => b.similarity - a.similarity);

    // check if top 5 chunks are dominated by one episode (3+ from same source)
    const top5 = ranked.slice(0, 5);
    const sourceCounts: Record<string, number> = {};
    for (const c of top5) {
        sourceCounts[c.source] = (sourceCounts[c.source] || 0) + 1;
    }

    const dominantSource = Object.entries(sourceCounts).find(([, count]) => count >= 3);

    // if one episode dominates: load full transcript + a few chunks from other episodes
    if (dominantSource) {
        const [source] = dominantSource;
        const fullTranscript = loadFullTranscript(source);

        // grab top chunks from OTHER episodes for cross-reference
        const otherChunks = ranked
            .filter((c) => c.source !== source)
            .slice(0, 4)
            .map((c) => `[Source: ${c.source}]\n${c.text}`)
            .join('\n\n---\n\n');

        const parts = [];
        if (fullTranscript) {
            parts.push(`# FULL TRANSCRIPT: ${source}\n\n${fullTranscript}`);
        }
        if (otherChunks) {
            parts.push(`# RELATED EXCERPTS FROM OTHER EPISODES\n\n${otherChunks}`);
        }
        return parts.join('\n\n---\n\n');
    }

    // otherwise: diverse chunks across episodes (max 3 per episode)
    const selected: typeof ranked = [];
    const perSource: Record<string, number> = {};

    for (const chunk of ranked) {
        if (selected.length >= 12) break;
        const count = perSource[chunk.source] || 0;
        if (count >= 3) continue;
        selected.push(chunk);
        perSource[chunk.source] = count + 1;
    }

    return selected.map((c) => `[Source: ${c.source}]\n${c.text}`).join('\n\n---\n\n');
}

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // extract latest user message text (content or parts)
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');

    let queryText = '';
    if (lastUserMessage) {
        if (typeof lastUserMessage.content === 'string' && lastUserMessage.content) {
            queryText = lastUserMessage.content;
        } else if (lastUserMessage.parts) {
            queryText = lastUserMessage.parts
                .filter((p: { type: string }) => p.type === 'text')
                .map((p: { type: string; text: string }) => p.text)
                .join(' ');
        }
    }

    const context = queryText ? await retrieveContext(queryText) : '';

    // build system prompt with full episode catalog + RAG context
    const catalog = buildEpisodeCatalog();

    const basePrompt = `You are Dasha's second brain — the AI that knows everything about the "Talks With Dasha" podcast.

# PERSONALITY
- Witty, concise, sharp. Like a friend who actually listened to every episode.
- Keep answers to 1-3 sentences max unless the user asks for detail.
- Always mention which guest/episode the info came from.
- When a question spans multiple episodes, reference all relevant ones.
- If you don't have info on something, say so honestly.

# ABOUT THE SHOW
"Talks With Dasha" is a podcast hosted by Dasha Shunina. She interviews ambitious founders, investors, and operators — mostly in Silicon Valley. Topics span startups, fundraising, AI, company building, hiring, culture, health, and the Bay Area ecosystem.

Dasha is also the founder of Women Tech Meetup (10,000+ female founders & women in tech), a Forbes contributor on venture capital, and works in GTM at Puzzle.
${catalog}`;

    const systemPrompt = context
        ? `${basePrompt}\n\n# RELEVANT TRANSCRIPT EXCERPTS\nUse these to inform your answer. Draw from multiple episodes when relevant. If the excerpts don't cover the question, say so.\n\n${context}`
        : basePrompt;

    const result = streamText({
        model: anthropic('claude-opus-4-6'),
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}
