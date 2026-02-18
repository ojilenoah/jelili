'use client';
import React, { createContext, useContext, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { errorEmitter } from './error-emitter';

interface FirebaseContextType {
    app: FirebaseApp | null;
    auth: Auth | null;
    firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
    app: null,
    auth: null,
    firestore: null,
});

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useContext(FirebaseContext).app;
export const useFirestore = () => useContext(FirebaseContext).firestore;
export const useAuth = () => useContext(FirebaseContext).auth;

function FirebaseErrorListener() {
    useEffect(() => {
        const handler = (error: Error) => {
            // The Next.js development overlay will pick this up
            throw error;
        };
        errorEmitter.on('permission-error', handler);
        return () => {
            errorEmitter.off('permission-error', handler);
        };
    }, []);

    return null;
}

export function FirebaseProvider({
    children,
    app,
    auth,
    firestore,
}: {
    children: React.ReactNode;
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
}) {
    return (
        <FirebaseContext.Provider value={{ app, auth, firestore }}>
            <FirebaseErrorListener />
            {children}
        </FirebaseContext.Provider>
    );
}
