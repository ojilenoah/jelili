"use client";

import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData, FirestoreError } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export const useCollection = <T extends DocumentData>(q: Query<T> | null) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        // Attempt to get path from query for error reporting. This is fragile.
        const path = (q as any)._query?.path?.segments.join('/') || 'unknown collection';
        const permissionError = new FirestorePermissionError({
          path: path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [q]);

  return { data, loading, error };
};
