// Firebase SDK subset used by the site, bundled to js/vendor/firebase.js:
//   cd tools/firebase && npm i firebase esbuild && npx esbuild entry.js --bundle --minify --format=iife --global-name=FB --outfile=../../js/vendor/firebase.js
export { initializeApp } from 'firebase/app';
export {
  initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, connectAuthEmulator,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
export {
  getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc,
  collection, getDocs, query, where, orderBy, limit, serverTimestamp, Timestamp
} from 'firebase/firestore/lite';
