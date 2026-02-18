import fs from "fs/promises";
import path from "path";

const STORAGE = path.resolve(process.cwd(), "tmp", "repo_prefs.json");

type RepoPref = { id: string; name: string; full_name: string; allowed: boolean };

async function readStorage(): Promise<Record<string, RepoPref[]>> {
  try {
    const raw = await fs.readFile(STORAGE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}

async function writeStorage(data: Record<string, RepoPref[]>) {
  await fs.mkdir(path.dirname(STORAGE), { recursive: true });
  await fs.writeFile(STORAGE, JSON.stringify(data, null, 2), "utf-8");
}

export async function getUserRepoPreferences(userId: string): Promise<RepoPref[]> {
  const store = await readStorage();
  if (store[userId]) return store[userId];

  // sensible default (sample repos)
  const defaults: RepoPref[] = [
    { id: "1", name: "xpull-server", full_name: "gianfrancodemarco/xpull-server", allowed: true },
    { id: "2", name: "xpull-web", full_name: "gianfrancodemarco/xpull-web", allowed: true },
    { id: "3", name: "other-repo", full_name: "gianfrancodemarco/other-repo", allowed: false },
  ];
  store[userId] = defaults;
  await writeStorage(store);
  return defaults;
}

export async function updateUserRepoPreference(userId: string, repoName: string, allow: boolean): Promise<RepoPref[]> {
  const store = await readStorage();
  const list = store[userId] ?? (await getUserRepoPreferences(userId));
  const idx = list.findIndex((r) => r.name === repoName || r.full_name === repoName);
  if (idx >= 0) {
    list[idx].allowed = allow;
  } else {
    // add if missing
    list.push({ id: String(Date.now()), name: repoName, full_name: repoName, allowed: allow });
  }
  store[userId] = list;
  await writeStorage(store);
  return list;
}
