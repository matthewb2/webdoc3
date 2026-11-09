// 최근 파일 이름 목록(settings)과 FileSystemFileHandle(IndexedDB)을 함께 관리.
// 웹 보안상 경로 문자열로 임의 파일을 읽을 수 없으므로, FSAA 핸들을 영속해
// 최근 항목 클릭 시 대화상자 없이 getFile()로 직접 불러온다.

import { addRecentFile as addRecentName, getRecentFiles as getRecentNames } from './settings';

const DB_NAME = 'webdoc3-recent';
const STORE = 'handles';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(name: string): Promise<FileSystemFileHandle | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(name);
      req.onsuccess = () => resolve((req.result as FileSystemFileHandle) || null);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    });
  } catch {
    return null;
  }
}

async function idbPut(name: string, handle: FileSystemFileHandle): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(handle, name);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  } catch {
    /* 저장 실패 무시 */
  }
}

async function idbDelete(name: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(name);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  } catch {
    /* ignore */
  }
}

export type RecentEntry = { name: string; hasHandle: boolean };

export function getRecentEntries(): string[] {
  return getRecentNames();
}

export async function addRecentEntry(name: string, handle?: FileSystemFileHandle | null): Promise<string[]> {
  const names = addRecentName(name);
  if (handle) await idbPut(name, handle);
  // 목록에서 밀려난 항목 핸들 정리
  const keep = new Set(names);
  // best-effort: 오래된 키는 자연스럽게 남을 수 있음(크기 작음)
  void keep;
  return names;
}

export async function getRecentHandle(name: string): Promise<FileSystemFileHandle | null> {
  return idbGet(name);
}

export async function verifyReadPermission(handle: FileSystemFileHandle): Promise<boolean> {
  try {
    const h = handle as any;
    if (typeof h.queryPermission === 'function') {
      const opts = { mode: 'read' };
      let perm = await h.queryPermission(opts);
      if (perm === 'granted') return true;
      if (perm === 'denied') return false;
      if (typeof h.requestPermission === 'function') {
        perm = await h.requestPermission(opts);
        return perm === 'granted';
      }
      return false;
    }
  } catch {
    return false;
  }
  // queryPermission API가 없으면 시도 허용(구현에 따라 getFile에서 판정)
  return true;
}

export async function removeRecentHandle(name: string): Promise<void> {
  await idbDelete(name);
}
