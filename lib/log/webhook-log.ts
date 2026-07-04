import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export type Provider = 'stripe' | 'chargebee' | 'paddle';

type LogEntry = {
  receivedAt: string;
  event: unknown;
};

const DATA_DIR = path.join(process.cwd(), '.data');

function logPath(provider: Provider): string {
  return path.join(DATA_DIR, `webhook-log-${provider}.json`);
}

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readEntries(provider: Provider): Promise<LogEntry[]> {
  try {
    const content = await readFile(logPath(provider), 'utf-8');
    return JSON.parse(content) as LogEntry[];
  } catch {
    return [];
  }
}

export async function append(provider: Provider, event: unknown): Promise<void> {
  await ensureDataDir();
  const entries = await readEntries(provider);
  entries.push({ receivedAt: new Date().toISOString(), event });
  await writeFile(logPath(provider), JSON.stringify(entries, null, 2));
}

export async function read(provider: Provider, limit?: number): Promise<LogEntry[]> {
  const entries = await readEntries(provider);
  const newest = entries.slice().reverse();
  return limit !== undefined ? newest.slice(0, limit) : newest;
}

export async function clear(provider: Provider): Promise<void> {
  await ensureDataDir();
  await writeFile(logPath(provider), '[]');
}
