/* ── Accounts (Firebase) ────────────────────────────────────────────────
   Paste the web-app config from Firebase console → Project settings →
   General → Your apps → Web app (the firebaseConfig object), e.g.

   window.FIREBASE_CONFIG = {
     apiKey: "AIza…", authDomain: "your-project.firebaseapp.com",
     projectId: "your-project", storageBucket: "…", messagingSenderId: "…", appId: "…"
   };

   These values identify the project; they are not secret. Access is
   controlled by firestore.rules. Leave null to run the site without accounts. */
window.FIREBASE_CONFIG = null;

/* The only account that sees the admin panel. Must match firestore.rules. */
window.ADMIN_EMAIL = 'sadeghimohammadamin83@gmail.com';
