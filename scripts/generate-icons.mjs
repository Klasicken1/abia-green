import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public", { recursive: true });

const svg = Buffer.from(`
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#1A6B3C"/>
  <text x="256" y="320" font-size="280" text-anchor="middle" fill="white">🌿</text>
</svg>
`);

await sharp(svg).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(svg).resize(512, 512).png().toFile("public/icon-512.png");
await sharp(svg).resize(180, 180).png().toFile("public/apple-touch-icon.png");

console.log("Icons generated");