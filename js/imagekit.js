// ============================================================
//  CareSphere — ImageKit Upload Helper (admin use only)
//  Calls /api/imagekit-auth to get a signed token,
//  then POSTs the file directly to ImageKit's upload API.
//
//  Usage:
//    import { uploadToImageKit } from "/js/imagekit.js";
//    const url = await uploadToImageKit(fileInputElement.files[0], "blogs");
// ============================================================

/**
 * Upload a File object to ImageKit via the secure server-signed flow.
 * @param {File}   file        — native File object from <input type="file">
 * @param {string} folder      — ImageKit folder, e.g. "blogs", "events", "team"
 * @param {string} [fileName]  — optional custom filename; defaults to file.name
 * @returns {Promise<string>}  — the CDN URL of the uploaded image
 */
export async function uploadToImageKit(file, folder = "uploads", fileName = null) {
  if (!file) throw new Error("No file provided");

  // 1. Get signed auth params from our Vercel function
  let authData;
  try {
    const authRes = await fetch("/api/imagekit-auth");
    if (!authRes.ok) {
      const text = await authRes.text().catch(() => authRes.status);
      throw new Error(`Auth endpoint returned ${authRes.status}: ${text}`);
    }
    authData = await authRes.json();
  } catch (e) {
    throw new Error("Failed to get ImageKit auth token: " + e.message);
  }

  const { token, expire, signature, publicKey, urlEndpoint } = authData;

  // 2. Build the FormData payload
  const form = new FormData();
  form.append("file",      file);
  form.append("fileName",  fileName || file.name.replace(/\s+/g, "-"));
  form.append("folder",    `/caresphere/${folder}`);
  form.append("publicKey", publicKey);
  form.append("signature", signature);
  form.append("expire",    String(expire));
  form.append("token",     token);

  // 3. POST directly to ImageKit's upload endpoint
  let uploadRes;
  try {
    uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body:   form,
    });
  } catch (e) {
    throw new Error("Network error reaching ImageKit: " + e.message);
  }

  if (!uploadRes.ok) {
    let errMsg = `ImageKit upload failed (${uploadRes.status})`;
    try {
      const err = await uploadRes.json();
      errMsg = err.message || err.error || JSON.stringify(err);
    } catch (_) {}
    throw new Error(errMsg);
  }

  const data = await uploadRes.json();
  return data.url;
}

/**
 * Build a transformed ImageKit URL (resize, format, quality).
 * @param {string} url  — original ImageKit URL
 * @param {object} opts — { w, h, q, f } width, height, quality, format
 */
export function ikTransform(url, { w = 800, h, q = 80, f = "webp" } = {}) {
  if (!url || !url.includes("imagekit.io")) return url;
  const transforms = [`w-${w}`, `q-${q}`, `f-${f}`];
  if (h) transforms.push(`h-${h}`);
  return url.replace(/\/([^/]+)$/, `/tr:${transforms.join(",")}/$1`);
}
