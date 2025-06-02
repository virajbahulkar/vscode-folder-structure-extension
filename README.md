# Folder Structure Generator

This VS Code extension helps you quickly scaffold folders and files using one of the following input styles:

### ✅ Features

- Paste from clipboard or input box
- Supports indented, slash-based, and tree structures
- Supports multi-file shorthand syntax (comma-separated files under folders)
- Automatically creates nested folders and files
- Edge-case safe (trailing slashes, duplicates, etc.)

### 📦 Usage

1. Open the command palette (⇧⌘P / Ctrl+Shift+P)
2. Run: `Generate Folder Structure`
3. Paste your folder structure or enter manually

---

### 🧠 Supported Input Styles

#### 1. Indented Format

Use indentation to denote folder hierarchy.
Folders end with a trailing slash `/`.

<pre>
``src/
components/
Button.tsx
Modal.tsx
utils/
helpers.js
README.md``
</pre>

---

#### 2. Tree Format

Use tree-like characters (`├──`, `└──`, `│`) to represent structure.

<pre>
``src
├── components
│ ├── Button.tsx
│ └── Modal.tsx
└── utils
└── helpers.js
README.md``
</pre>

---

#### 3. Multiple files per folder using commas and plus:

Use commas to specify multiple files under the same folder.

src/components/Button.tsx,Modal.tsx,Card.tsx+helpers/abc.js,pqr.js

This will create:

<pre>
``src/
components/
Button.tsx
Modal.tsx
Card.tsx
helpers/
abc.js
pqr.js``
</pre>

---

### Notes:

- Trailing slashes designate folders.
- Files are created empty.
- Nested folders are created recursively.
- Duplicate paths are ignored.
- The extension tries to auto-detect the input style.

---

Happy coding! 🚀
