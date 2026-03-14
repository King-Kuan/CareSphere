// ============================================================
//  CareSphere Admin — Shared Utilities
//  Import in every admin page that needs auth + helpers
// ============================================================
import { initializeApp }   from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, addDoc, updateDoc, deleteDoc, collection, serverTimestamp }
                           from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut }
                           from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const FC = {
  apiKey:"AIzaSyBwq7tPqEgv446a9p6I25oyXznwlEIwcwc",
  authDomain:"carespher.firebaseapp.com",
  projectId:"carespher",
  storageBucket:"carespher.firebasestorage.app",
  messagingSenderId:"1063379902456",
  appId:"1:1063379902456:web:f26ebd2dcbde18e86a000d"
};
export const app  = initializeApp(FC);
export const db   = getFirestore(app);
export const auth = getAuth(app);

// ── Auth guard ────────────────────────────────────────────
export function requireAuth(onUser) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return location.href = "login.html";
    const snap = await getDoc(doc(db, "admin_users", user.uid));
    if (!snap.exists()) { await signOut(auth); return location.href = "login.html"; }
    const data = snap.data();
    // Populate sidebar user info
    const name = `${data.firstName||""} ${data.lastName||""}`.trim() || "Admin";
    document.getElementById("sidebarName")?.setAttribute("textContent", name);
    if (document.getElementById("sidebarName"))
      document.getElementById("sidebarName").textContent = name;
    if (document.getElementById("sidebarAvatar"))
      document.getElementById("sidebarAvatar").textContent = (data.firstName||"A")[0].toUpperCase();
    onUser(user, data);
  });
}

// ── Logout ────────────────────────────────────────────────
export function setupLogout() {
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await signOut(auth); location.href = "login.html";
  });
}

// ── Mobile sidebar ────────────────────────────────────────
export function setupSidebar() {
  document.getElementById("menuToggle")?.addEventListener("click", () =>
    document.getElementById("sidebar")?.classList.toggle("open"));
}

// ── Toast notifications ───────────────────────────────────
export function toast(msg, type = "default", duration = 3500) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  const icon = type==="success"?"check-circle":type==="error"?"circle-exclamation":"info-circle";
  t.innerHTML = `<i class="fas fa-${icon}"></i> ${msg}`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity="0"; t.style.transform="translateX(30px)"; t.style.transition="all 0.3s"; setTimeout(()=>t.remove(),300); }, duration);
}

// ── Slug generator ────────────────────────────────────────
export function slugify(str) {
  return str.toLowerCase().trim().replace(/[^\w\s-]/g,"").replace(/[\s_-]+/g,"-").replace(/^-+|-+$/g,"");
}

// ── Date formatter ────────────────────────────────────────
export function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-RW",{year:"numeric",month:"short",day:"numeric"});
}

// ── CRUD helpers ──────────────────────────────────────────
export async function saveDoc(collName, data, id = null) {
  if (id) {
    const ref = doc(db, collName, id);
    await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
    return id;
  } else {
    const ref = await addDoc(collection(db, collName), {
      ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
    return ref.id;
  }
}

export async function deleteDocById(collName, id) {
  await deleteDoc(doc(db, collName, id));
}
