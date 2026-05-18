// ===================== Firebase 兼容层（实际调用本地 API） =====================
import { shortId } from './utils/db';

export const APP_ID = 'valley-school';
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 模拟 Firestore 对象：collection(db, 'teachers') → 返回名字字符串
function col(name) { return name; }

// 模拟 Firestore 的 doc 函数
function doc(collectionName, id) { return { collectionName, id }; }

// 模拟 Firestore 的 collection 函数
export function collection(db, ...parts) {
  // 拼接集合名：collection(db, 'students', 'dongguan') → 'students_dongguan'
  const parts2 = parts.filter(p => p && p !== APP_ID && p !== 'data');
  return parts2.join('_');
}

// 模拟 Firestore 的 addDoc
export async function addDoc(colRef, data) {
  const doc = { ...data, id: shortId(), createdAt: Date.now() };
  await fetch(`${API_BASE}/api/collection/${colRef}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  });
  return doc;
}

// 模拟 Firestore 的 setDoc
export async function setDoc(docRef, data) {
  const payload = { ...data, id: docRef.id };
  // PATCH = 如果存在就更新，否则需要先检查
  await fetch(`${API_BASE}/api/collection/${docRef.collectionName}/${docRef.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// 模拟 Firestore 的 updateDoc
export async function updateDoc(docRef, data) {
  await fetch(`${API_BASE}/api/collection/${docRef.collectionName}/${docRef.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// 模拟 Firestore 的 deleteDoc
export async function deleteDoc(docRef) {
  await fetch(`${API_BASE}/api/collection/${docRef.collectionName}/${docRef.id}`, {
    method: 'DELETE',
  });
}

// 模拟 Firestore 的 doc 函数（也需要导出）
export function doc(db, collectionName, ...parts) {
  const colName = collection(db, collectionName, ...parts);
  return { collectionName: colName, id: null };
}

// 模拟 Firestore 的 onSnapshot（轮询替换）
export function onSnapshot(colRef, callback, errorCallback) {
  let cancelled = false;
  const poll = async () => {
    if (cancelled) return;
    try {
      const res = await fetch(`${API_BASE}/api/collection/${colRef}`);
      const data = await res.json();
      callback({
        docs: data.map(d => ({
          id: d.id,
          data: () => ({ ...d, id: d.id }),
        })),
        docChanges: () => [],
        forEach: (fn) => data.forEach(d => fn({
          id: d.id,
          data: () => ({ ...d, id: d.id }),
        })),
      });
    } catch (e) {
      if (errorCallback) errorCallback(e);
    }
    if (!cancelled) setTimeout(poll, 3000);
  };
  poll();
  return () => { cancelled = true; };
}

// 导出 db 对象（模拟 Firestore）
export const db = {
  collection: (name) => name,
  doc: (collectionName, id) => ({ collectionName, id }),
};

// 为了兼容性也导出 auth 和 firebaseReady
export const auth = null;
export const firebaseReady = true;
