// ===================== 前端 API 层（替换 Firebase） =====================
// 本地开发指向 localhost:3001，生产环境指向 Zeabur 域名
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}/api${path}`, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
}

// ===================== 通用 CRUD =====================
export function getCollection(name) {
  return request('GET', `/collection/${name}`);
}

export function addToCollection(name, data) {
  return request('POST', `/collection/${name}`, data);
}

export function updateCollectionItem(name, id, data) {
  return request('PATCH', `/collection/${name}/${id}`, data);
}

export function deleteCollectionItem(name, id) {
  return request('DELETE', `/collection/${name}/${id}`);
}

export function deleteCollectionItemsByField(name, field, value) {
  return request('DELETE', `/collection/${name}?field=${field}&value=${value}`);
}

// ===================== 简易订阅（轮询） =====================
const listeners = {};
let pollTimers = {};

export function subscribe(collectionName, callback, pollInterval = 3000) {
  // 立即获取一次
  getCollection(collectionName).then(callback).catch(console.warn);
  // 轮询
  const timer = setInterval(async () => {
    try {
      const data = await getCollection(collectionName);
      callback(data);
    } catch {}
  }, pollInterval);
  return () => clearInterval(timer);
}

// ===================== 验证函数 =====================
export function isApiAvailable() {
  return request('GET', '/collection/teachers').then(() => true).catch(() => false);
}
