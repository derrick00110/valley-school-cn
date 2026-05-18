// ===================== Firebase 兼容层（实际调用 Supabase） =====================
import { shortId } from './utils/db';

export const APP_ID = 'valley-school';

const SUPABASE_URL = 'https://zkzlqtvssirxbblfpqsn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_P5UU2t1-R_hlx2Axzt0RhA_Tc9t-vzy';

async function supabaseFetch(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    console.warn('Supabase error:', err);
    return null;
  }
  return res.json();
}

// ===================== 集合名转换 =====================
// collection(db, 'teachers') → 'teachers'
// collection(db, APP_ID, 'data', 'students_dongguan') → 'students_dongguan'
export function collection(db, ...parts) {
  const parts2 = parts.filter(p => p && p !== APP_ID && p !== 'data');
  return parts2.join('_');
}

export function doc(collectionName, id) {
  return { collectionName, id };
}

// ===================== 写操作 =====================

export async function addDoc(colRef, data) {
  const payload = { ...data, id: shortId(), createdAt: Date.now() };
  const result = await supabaseFetch(colRef, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return { id: payload.id };
}

export async function setDoc(docRef, data) {
  const payload = { ...data, id: docRef.id, createdAt: Date.now() };
  // Upsert: 尝试插入，如果 id 冲突则更新
  await supabaseFetch(`${docRef.collectionName}?id=eq.${docRef.id}`, {
    method: 'DELETE',
  });
  await supabaseFetch(docRef.collectionName, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateDoc(docRef, data) {
  // 先获取现有数据，合并后更新
  await supabaseFetch(`${docRef.collectionName}?id=eq.${docRef.id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteDoc(docRef) {
  await supabaseFetch(`${docRef.collectionName}?id=eq.${docRef.id}`, {
    method: 'DELETE',
  });
}

// ===================== 读操作（轮询替代 onSnapshot） =====================

export function onSnapshot(colRef, callback, errorCallback) {
  let cancelled = false;
  let lastData = '';

  const poll = async () => {
    if (cancelled) return;
    try {
      const data = await supabaseFetch(`${colRef}?order=createdAt.desc`);
      if (!cancelled && data) {
        const str = JSON.stringify(data);
        if (str !== lastData) {
          lastData = str;
          callback({
            docs: data.map(d => ({
              id: d.id,
              data: () => ({ ...d, id: d.id }),
            })),
            docChanges: () => data.map(d => ({
              type: 'added',
              doc: { id: d.id, data: () => ({ ...d, id: d.id }) },
            })),
            forEach: (fn) => data.forEach(d => fn({
              id: d.id,
              data: () => ({ ...d, id: d.id }),
            })),
          });
        }
      }
    } catch (e) {
      if (!cancelled && errorCallback) errorCallback(e);
    }
    if (!cancelled) setTimeout(poll, 3000);
  };
  poll();
  return () => { cancelled = true; };
}

// ===================== 兼容对象 =====================

export const db = {};
export const auth = null;
export const firebaseReady = true;
