// ===================== Supabase API 层 =====================
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
    throw new Error(`Supabase ${res.status}: ${err}`);
  }
  return res.json();
}

// ===================== 通用 CRUD =====================

/** 获取集合所有数据 */
export function getCollection(name) {
  return supabaseFetch(`${name}?order=createdAt.desc`);
}

/** 添加文档 */
export function addToCollection(name, data) {
  return supabaseFetch(name, {
    method: 'POST',
    body: JSON.stringify({ ...data, createdAt: Date.now() }),
  });
}

/** 更新文档（按 id 字段匹配） */
export function updateCollectionItem(name, id, data) {
  return supabaseFetch(`${name}?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** 删除文档（按 id 字段匹配） */
export function deleteCollectionItem(name, id) {
  return supabaseFetch(`${name}?id=eq.${id}`, {
    method: 'DELETE',
  });
}

/** 按字段批量删除 */
export function deleteCollectionItemsByField(name, field, value) {
  return supabaseFetch(`${name}?${field}=eq.${encodeURIComponent(value)}`, {
    method: 'DELETE',
  });
}

/** 轮询订阅（替代 onSnapshot） */
export function subscribe(collectionName, callback, pollInterval = 3000) {
  getCollection(collectionName).then(callback).catch(console.warn);
  const timer = setInterval(async () => {
    try { callback(await getCollection(collectionName)); } catch {}
  }, pollInterval);
  return () => clearInterval(timer);
}
