import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const svg = fs.readFileSync(path.join(root, "public/icons/icon-maskable.svg"));
const outDir = path.join(root, "public/icons");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  await sharp(svg).resize(size, size).png().toFile(path.join(outDir, `icon-${size}.png`));
}

console.log("Generated PWA icons from icon-maskable.svg: icon-192.png, icon-512.png");
