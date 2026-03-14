// ============================================================
//  CareSphere — Public Analytics Tracker
//  Drop <script type="module" src="/js/tracker.js"></script>
//  at the bottom of every public HTML page.
// ============================================================
import { db } from "./firebase.js";
import {
  doc, getDoc, setDoc, updateDoc, increment, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(async () => {
  try {
    const page   = location.pathname.replace(/\/$/, "") || "/index.html";
    const today  = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // 1 — per-page lifetime counter
    const pageRef = doc(db, "analytics_pages", btoa(page).replace(/=/g,""));
    const snap    = await getDoc(pageRef);
    if (snap.exists()) {
      await updateDoc(pageRef, { views: increment(1), lastSeen: serverTimestamp() });
    } else {
      await setDoc(pageRef, { page, views: 1, lastSeen: serverTimestamp() });
    }

    // 2 — daily totals (for the dashboard chart)
    const dayRef  = doc(db, "analytics_daily", today);
    const daySnap = await getDoc(dayRef);
    if (daySnap.exists()) {
      await updateDoc(dayRef, { visits: increment(1) });
    } else {
      await setDoc(dayRef, { date: today, visits: 1 });
    }

    // 3 — referrer tracking (optional, silent)
    if (document.referrer) {
      const ref = new URL(document.referrer).hostname;
      const rRef = doc(db, "analytics_referrers", ref.replace(/\./g,"_"));
      const rSnap = await getDoc(rRef);
      if (rSnap.exists()) {
        await updateDoc(rRef, { count: increment(1) });
      } else {
        await setDoc(rRef, { referrer: ref, count: 1 });
      }
    }
  } catch (_) { /* silent — never break the public page */ }
})();
