import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public/icons");
const anySvg = fs.readFileSync(path.join(root, "public/icons/icon-any.svg"));
const maskableSvg = fs.readFileSync(
  path.join(root, "public/icons/icon-maskable.svg")
);

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function writePng(svg, size, filePath) {
  await sharp(svg).resize(size, size).png().toFile(filePath);
}

// Home screen / desktop shortcut icons (any)
for (const size of [192, 512]) {
  await writePng(anySvg, size, path.join(outDir, `icon-${size}.png`));
}

// Maskable (Android adaptive icons)
await writePng(maskableSvg, 512, path.join(outDir, "icon-maskable-512.png"));

// Apple touch icon (iOS Add to Home Screen)
await writePng(anySvg, 180, path.join(root, "public/apple-touch-icon.png"));
await writePng(anySvg, 180, path.join(outDir, "apple-touch-icon.png"));

// Small favicon fallback
await writePng(anySvg, 32, path.join(outDir, "favicon-32.png"));
await writePng(anySvg, 48, path.join(outDir, "favicon-48.png"));

console.log(
  "Generated shortcut icons: icon-192/512, maskable-512, apple-touch-icon, favicon-32/48"
);
