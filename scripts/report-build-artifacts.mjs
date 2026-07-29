import { readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const distRoot = resolve(fileURLToPath(new URL("../dist", import.meta.url)));

function collectFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(fullPath));
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

const files = collectFiles(distRoot).map((fullPath) => {
  const path = relative(distRoot, fullPath).replaceAll("\\", "/");
  const extension = path.includes(".") ? path.slice(path.lastIndexOf(".")).toLowerCase() : "[none]";
  return { path, extension, bytes: statSync(fullPath).size };
});

const byExtension = {};
for (const file of files) {
  byExtension[file.extension] = (byExtension[file.extension] ?? 0) + file.bytes;
}

const largestFiles = [...files]
  .sort((left, right) => right.bytes - left.bytes || left.path.localeCompare(right.path))
  .slice(0, 20);

console.log(JSON.stringify({
  schemaVersion: 1,
  fileCount: files.length,
  totalBytes: files.reduce((total, file) => total + file.bytes, 0),
  byExtension: Object.fromEntries(Object.entries(byExtension).sort(([left], [right]) => left.localeCompare(right))),
  largestFiles,
}, null, 2));
