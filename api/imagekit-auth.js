// ============================================================
//  Vercel Serverless Function — /api/imagekit-auth.js
//  Signs an ImageKit upload request server-side so the
//  private key is NEVER shipped to the browser.
//
//  Deploy: place this file at  api/imagekit-auth.js
//  in your Vercel project root. Vercel auto-detects it.
//
//  Set these in Vercel Environment Variables (not in code):
//    IMAGEKIT_PRIVATE_KEY  =  private_BTxr6AfJxsmM7gjrrO9aHcadDAI=
//    IMAGEKIT_PUBLIC_KEY   =  public_Dm9o2L7td86DzeKvGQMW6hUNQN0=
//    IMAGEKIT_URL_ENDPOINT =  https://ik.imagekit.io/caresphere
// ============================================================

const crypto = require("crypto");

module.exports = async (req, res) => {
  // CORS — allow only your own domain in production
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")     return res.status(405).json({ error: "Method not allowed" });

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    return res.status(500).json({ error: "ImageKit private key not configured" });
  }

  // ImageKit auth signature: HMAC-SHA1 of (token + expire) with private key
  const token   = crypto.randomUUID();
  const expire  = Math.floor(Date.now() / 1000) + 2400; // valid 40 min
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  return res.status(200).json({
    token,
    expire,
    signature,
    publicKey:   process.env.IMAGEKIT_PUBLIC_KEY   || "public_Dm9o2L7td86DzeKvGQMW6hUNQN0=",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/caresphere",
  });
};
