/**
 * 山谷学校 API 封装 Hook - 替代 Firestore
 * 用法与 Firestore onSnapshot/setDoc/deleteDoc 语义一致
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getCollection,
  addToCollection,
  updateCollectionItem,
  deleteCollectionItem,
  deleteCollectionItemsByField,
} from '../api';

// 生成短 ID
export function shortId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * 监听集合（类似 onSnapshot）
 * 返回 [data, loading, error]
 */
export function useCollection<T = any>(collectionName: string, pollInterval = 3000): [T[], boolean, string] {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const result = await getCollection(collectionName);
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      }
    };
    fetchData();
    const timer = setInterval(fetchData, pollInterval);
    return () => { cancelled = true; clearInterval(timer); };
  }, [collectionName, pollInterval]);

  return [data, loading, error];
}

/**
 * 添加文档（类似 setDoc with auto-ID）
 */
export async function addDocument(collectionName: string, data: any) {
  const doc = { ...data, id: shortId() };
  await addToCollection(collectionName, doc);
  return doc;
}

/**
 * 更新文档（类似 updateDoc）
 */
export async function updateDocument(collectionName: string, id: string, data: any) {
  await updateCollectionItem(collectionName, id, data);
  return { id, ...data };
}

/**
 * 删除文档（类似 deleteDoc）
 */
export async function removeDocument(collectionName: string, id: string) {
  await deleteCollectionItem(collectionName, id);
}

/**
 * 批量删除（类似 delete where field = value）
 */
export async function removeDocumentsByField(collectionName: string, field: string, value: string) {
  await deleteCollectionItemsByField(collectionName, field, value);
}

/**
 * 格式化日期 YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
