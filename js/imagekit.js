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
  const authRes = await fetch("/api/imagekit-auth");
  if (!authRes.ok) throw new Error("Failed to get ImageKit auth token");
  const { token, expire, signature, publicKey, urlEndpoint } = await authRes.json();

  // 2. Build the FormData payload
  const form = new FormData();
  form.append("file",      file);
  form.append("fileName",  fileName || file.name.replace(/\s+/g, "-"));
  form.append("folder",    `/caresphere/${folder}`);
  form.append("publicKey", publicKey);
  form.append("signature", signature);
  form.append("expire",    expire);
  form.append("token",     token);

  // 3. POST directly to ImageKit's upload endpoint
  const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body:   form,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.message || "ImageKit upload failed");
  }

  const data = await uploadRes.json();
  return data.url; // full CDN URL, e.g. https://ik.imagekit.io/caresphere/blogs/photo.jpg
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
