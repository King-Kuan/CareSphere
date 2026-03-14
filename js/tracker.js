// ============================================================
//  CareSphere — Public Analytics Tracker
//  Self-contained — no dependency on firebase.js
// ============================================================
import { initializeApp, getApps }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(async () => {
  try {
    const FC = {
      apiKey:            "AIzaSyBwq7tPqEgv446a9p6I25oyXznwlEIwcwc",
      authDomain:        "carespher.firebaseapp.com",
      projectId:         "carespher",
      storageBucket:     "carespher.firebasestorage.app",
      messagingSenderId: "1063379902456",
      appId:             "1:1063379902456:web:f26ebd2dcbde18e86a000d"
    };

    // Reuse existing app if already initialised on this page
    const app = getApps().length ? getApps()[0] : initializeApp(FC);
    const db  = getFirestore(app);

    const page  = location.pathname.replace(/\/$/, "") || "/index.html";
    const today = new Date().toISOString().slice(0, 10);

    // 1 — per-page lifetime view counter
    const pageId  = btoa(encodeURIComponent(page)).replace(/[^a-zA-Z0-9]/g, "");
    const pageRef = doc(db, "analytics_pages", pageId);
    const pageSnap = await getDoc(pageRef);
    if (pageSnap.exists()) {
      await updateDoc(pageRef, { views: increment(1), lastSeen: serverTimestamp() });
    } else {
      await setDoc(pageRef, { page, views: 1, lastSeen: serverTimestamp() });
    }

    // 2 — daily visit counter
    const dayRef  = doc(db, "analytics_daily", today);
    const daySnap = await getDoc(dayRef);
    if (daySnap.exists()) {
      await updateDoc(dayRef, { visits: increment(1) });
    } else {
      await setDoc(dayRef, { date: today, visits: 1 });
    }

    // 3 — referrer tracking
    if (document.referrer) {
      try {
        const ref  = new URL(document.referrer).hostname;
        const rId  = ref.replace(/[^a-zA-Z0-9]/g, "_");
        const rRef = doc(db, "analytics_referrers", rId);
        const rSnap = await getDoc(rRef);
        if (rSnap.exists()) {
          await updateDoc(rRef, { count: increment(1) });
        } else {
          await setDoc(rRef, { referrer: ref, count: 1 });
        }
      } catch (_) {}
    }

  } catch (e) {
    // Silent in production — uncomment to debug:
    // console.warn("[Tracker]", e.message);
  }
})();
