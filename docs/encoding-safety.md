# UNFOLD text encoding safety

UNFOLD has many Japanese HTML, JavaScript strings, rule pages, and generated review files. On Windows, Japanese text can break when a file is read or written without an explicit UTF-8 encoding. The common failure pattern is:

- PowerShell `Set-Content` writes UTF-16LE or a locale-dependent encoding.
- A file without BOM is read as the wrong code page.
- Japanese text becomes mojibake such as replacement characters or garbled kanji.
- HTML attributes can be broken when a bulk replace is performed on already-misread text.

Before upload or commit, run:

```powershell
cd .\laravel-app
npm run check:all
```

For a deeper check that also scans generated experiment logs:

```powershell
cd .\laravel-app
npm run check:text:all
```

To install the same guard as a local Git pre-commit hook:

```powershell
cd .\laravel-app
npm.cmd run install:hooks
```

Safe editing rules:

- Prefer `apply_patch` for manual edits.
- Do not use PowerShell `Set-Content` or `Out-File` without an explicit UTF-8 encoding.
- If a script must rewrite text files, use Node `fs.writeFileSync(file, text, "utf8")` or Python `Path.write_text(..., encoding="utf-8")`.
- After bulk replacements, always run `npm run check:all`.
