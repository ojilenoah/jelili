"use client";
import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentData, FirestoreError } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export const useDoc = <T extends DocumentData>(docPath: string) => {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!firestore) {
      setLoading(false);
      return;
    };
    const docRef = doc(firestore, docPath);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setData({ id: snapshot.id, ...snapshot.data() } as T);
      } else {
        setData(null);
      }
      setLoading(false);
    },
    (err) => {
      const permissionError = new FirestorePermissionError({
        path: docPath,
        operation: 'get',
      });
      errorEmitter.emit('permission-error', permissionError);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, docPath]);

  return { data, loading, error };
};
