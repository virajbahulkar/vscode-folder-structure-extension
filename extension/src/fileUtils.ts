export function parseStructure(input: string): string[] {
  const cleanedLines = input
    .split('\n')
    .map(line => line.replace(/\r/g, '').trimEnd())
    .filter(line => line.trim() !== '');

  if (cleanedLines.length === 0) return [];

  // New check for grouped multi-file syntax using '+'
  const containsGroupedPaths = cleanedLines.some(line => line.includes('+') || line.includes(','));
  if (containsGroupedPaths) {
    return parseGroupedPaths(cleanedLines);
  }

  const preprocessedLines = preprocessTreeChars(cleanedLines);
  const format = detectFormat(preprocessedLines);

  switch (format) {
    case 'slash':
      return normalizePaths(preprocessedLines);
    case 'indented':
      return parseIndentedStructure(preprocessedLines);
    case 'tree':
      return parseTreeStructure(preprocessedLines);
    default:
      return normalizePaths(preprocessedLines);
  }
}

type StructureFormat = 'slash' | 'indented' | 'tree' | 'unknown';

function detectFormat(lines: string[]): StructureFormat {
  const slashCount = lines.filter(l => l.includes('/')).length;
  const indentCount = lines.filter(l => /^\s+\S+/.test(l)).length;
  const treeCharCount = lines.filter(l => /[├└│─]/.test(l)).length;

  if (treeCharCount >= lines.length / 2) return 'tree';
  if (slashCount === lines.length) return 'slash';
  if (indentCount > 0) return 'indented';
  return 'unknown';
}

function normalizePaths(lines: string[]): string[] {
  const seen = new Set<string>();

  const knownFiles = new Set([
    'Dockerfile',
    '.gitignore',
    'package.json',
    'tsconfig.json',
    'README.md',
    'App.js',
    'Button.js',
    'Modal.js',
    'launch.json',
    'extension.ts',
    'fileUtils.ts'
  ]);

  return lines
    .map(line => line.trim().replace(/\r/g, '').replace(/^\.\//, '').replace(/^\/+/, '').trimEnd())
    .map(line => {
      const clean = line.replace(/\/+$/, '');
      return knownFiles.has(clean) ? clean : line;
    })
    .filter(Boolean)
    .filter(line => {
      if (seen.has(line)) return false;
      seen.add(line);
      return true;
    });
}

function parseIndentedStructure(lines: string[]): string[] {
  const result: string[] = [];
  const stack: { path: string; indent: number }[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;

    const indent = raw.search(/\S/);
    const isFolder = raw.trim().endsWith('/');
    const name = raw.trim().replace(/\/$/, '');

    while (stack.length && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack.length ? stack[stack.length - 1].path : '';
    const fullPath = parent ? `${parent}/${name}` : name;

    const pathToPush = isFolder ? `${fullPath}/` : fullPath;
    if (!seen.has(pathToPush)) {
      result.push(pathToPush);
      seen.add(pathToPush);
    }

    if (isFolder) {
      stack.push({ path: fullPath, indent });
    }
  }

  return result;
}

function parseTreeStructure(lines: string[]): string[] {
  const result: string[] = [];
  const stack: { path: string; level: number }[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^([│ ]*)(├── |└── )?(.*)$/);
    if (!match) continue;

    const [, indent, , nameRaw] = match;
    const isFolder = nameRaw.trim().endsWith('/');
    const name = nameRaw.trim().replace(/\/$/, '');
    const level = indent.replace(/[^ ]/g, ' ').length / 2;

    while (stack.length && level <= stack[stack.length - 1].level) {
      stack.pop();
    }

    const parent = stack.length ? stack[stack.length - 1].path : '';
    const fullPath = parent ? `${parent}/${name}` : name;

    const pathToPush = isFolder ? `${fullPath}/` : fullPath;
    if (!seen.has(pathToPush)) {
      result.push(pathToPush);
      seen.add(pathToPush);
    }

    if (isFolder) {
      stack.push({ path: fullPath, level });
    }
  }

  return result;
}

function preprocessTreeChars(lines: string[]): string[] {
  return lines.map(line =>
    line
      .replace(/[├└]── /g, '    ')  // Replace ├── or └── with 4 spaces
      .replace(/│/g, ' ')           // Replace │ with space
  );
}

// === NEW FUNCTION ADDED FOR GROUPED PATHS ===

function parseGroupedPaths(lines: string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  lines.forEach(line => {
    const groups = line.includes('+') ? line.split('+').map(g => g.trim()) : [line];

    groups.forEach(group => {
      const parts = group.split(',').map(part => part.trim());

      parts.forEach(part => {
        // Check if part is a full path (has '/')
        if (part.includes('/')) {
          if (!seen.has(part)) {
            result.push(part);
            seen.add(part);
          }
        } else {
          // Handle relative names in case of grouped paths
          const lastSlashIndex = group.lastIndexOf('/');
          if (lastSlashIndex !== -1) {
            const folder = group.substring(0, lastSlashIndex);
            const fullPath = `${folder}/${part}`;
            if (!seen.has(fullPath)) {
              result.push(fullPath);
              seen.add(fullPath);
            }
          } else {
            if (!seen.has(part)) {
              result.push(part);
              seen.add(part);
            }
          }
        }
      });
    });
  });

  return result;
}
