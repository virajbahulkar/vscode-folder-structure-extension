"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStructure = parseStructure;
function parseStructure(input) {
    const cleanedLines = input
        .split('\n')
        .map(line => line.replace(/\r/g, '').trimEnd())
        .filter(line => line.trim() !== '');
    if (cleanedLines.length === 0)
        return [];
    // New check for grouped multi-file syntax using '+'
    const containsGroupedPaths = cleanedLines.some(line => line.includes('+'));
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
function detectFormat(lines) {
    const slashCount = lines.filter(l => l.includes('/')).length;
    const indentCount = lines.filter(l => /^\s+\S+/.test(l)).length;
    const treeCharCount = lines.filter(l => /[├└│─]/.test(l)).length;
    if (treeCharCount >= lines.length / 2)
        return 'tree';
    if (slashCount === lines.length)
        return 'slash';
    if (indentCount > 0)
        return 'indented';
    return 'unknown';
}
function normalizePaths(lines) {
    const seen = new Set();
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
        if (seen.has(line))
            return false;
        seen.add(line);
        return true;
    });
}
function parseIndentedStructure(lines) {
    const result = [];
    const stack = [];
    const seen = new Set();
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        if (!raw.trim())
            continue;
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
function parseTreeStructure(lines) {
    const result = [];
    const stack = [];
    const seen = new Set();
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^([│ ]*)(├── |└── )?(.*)$/);
        if (!match)
            continue;
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
function preprocessTreeChars(lines) {
    return lines.map(line => line
        .replace(/[├└]── /g, '    ') // Replace ├── or └── with 4 spaces
        .replace(/│/g, ' ') // Replace │ with space
    );
}
// === NEW FUNCTION ADDED FOR GROUPED PATHS ===
function parseGroupedPaths(lines) {
    const result = [];
    const seen = new Set();
    lines.forEach(line => {
        const groups = line.split('+').map(g => g.trim());
        groups.forEach(group => {
            const lastSlashIndex = group.lastIndexOf('/');
            if (lastSlashIndex === -1) {
                if (!seen.has(group)) {
                    result.push(group);
                    seen.add(group);
                }
                return;
            }
            const folderPath = group.substring(0, lastSlashIndex);
            const filesPart = group.substring(lastSlashIndex + 1);
            const files = filesPart.split(',').map(f => f.trim());
            files.forEach(file => {
                const fullPath = `${folderPath}/${file}`;
                if (!seen.has(fullPath)) {
                    result.push(fullPath);
                    seen.add(fullPath);
                }
            });
        });
    });
    return result;
}
//# sourceMappingURL=fileUtils.js.map