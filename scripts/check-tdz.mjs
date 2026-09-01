#!/usr/bin/env node
// Finds hook dependency arrays that name a const/let declared LOWER in the SAME
// top-level function. A dependency array is an ordinary expression evaluated
// during render, top to bottom, so naming a binding from further down reads it
// inside the temporal dead zone and throws:
//
//     ReferenceError: Cannot access 'X' before initialization
//
// Neither the build nor an import check catches this: the binding does exist in
// the file, just later. Only rendering the page catches it, and the screens
// that matter sit behind a login.
//
// Scoping matters. An earlier version of this script was file-scoped and
// therefore useless — Agency.jsx declares `addClient` in two different
// components, so the real bug at line 973 was excused by an unrelated
// declaration at line 229. Declarations are now only considered inside the
// function that actually contains the dependency array.
import fs from "node:fs";
import path from "node:path";

const roots = process.argv.slice(2);
if (!roots.length) { console.error("usage: check-tdz.mjs <dir|file> [...]"); process.exit(2); }

const files = [];
const walk = p => {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    if (/node_modules|dist|\.git/.test(p)) return;
    for (const e of fs.readdirSync(p)) walk(path.join(p, e));
  } else if (/\.jsx?$/.test(p)) files.push(p);
};
roots.forEach(walk);

let problems = 0;

for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n");

  // Top-level functions start at column 0 and run until the next one.
  const starts = [];
  lines.forEach((l, i) => {
    if (/^(?:export\s+)?(?:async\s+)?function\s+[A-Za-z_$]/.test(l)) starts.push(i);
  });
  const blocks = starts.map((s, i) => ({ from: s, to: (starts[i + 1] ?? lines.length) - 1 }));
  if (!blocks.length) blocks.push({ from: 0, to: lines.length - 1 });

  for (const b of blocks) {
    // declarations inside THIS function only
    const declaredAt = new Map();
    for (let i = b.from; i <= b.to; i++) {
      const m = lines[i].match(
        /^\s*(?:const|let)\s+(?:\[\s*([A-Za-z_$][\w$]*)\s*(?:,\s*([A-Za-z_$][\w$]*)\s*)?\]|([A-Za-z_$][\w$]*))\s*=/
      );
      if (!m) continue;
      for (const n of m.slice(1).filter(Boolean)) if (!declaredAt.has(n)) declaredAt.set(n, i + 1);
    }

    // dependency arrays inside THIS function only
    const body = lines.slice(b.from, b.to + 1).join("\n");
    const depRe = /\}\s*,\s*\[([^\]]*)\]\s*\)/g;
    let m;
    while ((m = depRe.exec(body)) !== null) {
      const line = b.from + body.slice(0, m.index).split("\n").length;
      for (const raw of m[1].split(",")) {
        const dep = raw.trim();
        if (!/^[A-Za-z_$][\w$.]*$/.test(dep)) continue;
        const base = dep.split(".")[0];
        const at = declaredAt.get(base);
        if (at && at > line) {
          console.log(`  ${file}:${line}  dep "${base}" is declared below it, at line ${at}`);
          problems++;
        }
      }
    }
  }
}

console.log(problems
  ? `\n  ${problems} temporal-dead-zone reference(s) — each throws at render`
  : "  clean — no dependency array reads a binding declared below it");
process.exit(problems ? 1 : 0);
