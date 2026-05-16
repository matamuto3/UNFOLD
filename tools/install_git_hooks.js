const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const hookDir = path.join(repoRoot, ".git", "hooks");
const hookPath = path.join(hookDir, "pre-commit");

if (!fs.existsSync(path.join(repoRoot, ".git"))) {
  console.error("Cannot find .git directory. Run this from the UNFOLD repository.");
  process.exit(1);
}

fs.mkdirSync(hookDir, { recursive: true });

const hookBody = `#!/bin/sh
set -eu

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

node tools/check_text_integrity.js
node --check laravel-app/public/app.js
node --check laravel-app/public/three-board.js
node --check tools/run_unfold_selfplay.js
node --check tools/run_unfold_tactical_tests.js
`;

fs.writeFileSync(hookPath, hookBody, { encoding: "utf8", mode: 0o755 });
fs.chmodSync(hookPath, 0o755);

console.log("Installed pre-commit hook: " + path.relative(repoRoot, hookPath));
