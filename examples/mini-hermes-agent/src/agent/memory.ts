import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

interface MemoryFile {
  entries: string[];
}

export class MemoryStore {
  constructor(private readonly filePath: string) {}

  async list(): Promise<string[]> {
    const file = await this.readFile();
    return file.entries;
  }

  async add(entry: string): Promise<string[]> {
    const normalized = entry.trim();
    if (!normalized) {
      return this.list();
    }

    const file = await this.readFile();
    if (!file.entries.includes(normalized)) {
      file.entries.push(normalized);
      await this.writeFile(file);
    }
    return file.entries;
  }

  async search(query: string): Promise<string[]> {
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const entries = await this.list();
    if (terms.length === 0) {
      return entries;
    }
    return entries.filter((entry) => {
      const lower = entry.toLowerCase();
      return terms.some((term) => lower.includes(term));
    });
  }

  private async readFile(): Promise<MemoryFile> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw) as MemoryFile;
      return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
    } catch {
      return { entries: [] };
    }
  }

  private async writeFile(file: MemoryFile): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(file, null, 2)}\n`, 'utf8');
  }
}
