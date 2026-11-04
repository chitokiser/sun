/**
 * BestClub 공용 Firebase (jumper-b15aa) — 대한김치·BEST WINNER 와 동일한 웹 설정.
 * 웹 API 키는 공개용 식별자이며, 실제 접근 제어는 Firestore 보안 규칙이 담당합니다.
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, collection, query, where, onSnapshot, doc, getDoc, setDoc, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyD6oGXWcQIAa46ZiO6E9fBWOXqiNCAL4-c',
  authDomain: 'jumper-b15aa.firebaseapp.com',
  projectId: 'jumper-b15aa',
  storageBucket: 'jumper-b15aa.firebasestorage.app',
  messagingSenderId: '1051842479371',
  appId: '1:1051842479371:web:cd0dca2c1eab0e44b58e0e',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export const fb = {
  signIn: () => signInWithPopup(auth, provider),
  signOut: () => signOut(auth),
  onAuth: (cb) => onAuthStateChanged(auth, cb),
  collection, query, where, onSnapshot, doc, getDoc, setDoc, serverTimestamp,
};
