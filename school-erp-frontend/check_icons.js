import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as lucide from 'lucide-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validIcons = new Set(Object.keys(lucide));
const pagesDir = path.join(__dirname, 'src', 'pages');

const checkImportsInFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g;

    let match;
    let foundInvalid = false;
    while ((match = importRegex.exec(content)) !== null) {
        const importBlock = match[1];
        const imports = importBlock.split(',').map(i => i.split(' as ')[0].trim()).filter(i => i);

        const invalidImports = imports.filter(icon => !validIcons.has(icon));
        if (invalidImports.length > 0) {
            console.log(`[INVALID] ${path.basename(filePath)} : ${invalidImports.join(', ')}`);
            foundInvalid = true;
        }
    }
};

const findInvalidImports = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findInvalidImports(fullPath);
        } else if (file.endsWith('.jsx')) {
            checkImportsInFile(fullPath);
        }
    }
};

console.log('Checking pages for invalid lucide-react imports...');
findInvalidImports(pagesDir);
checkImportsInFile(path.join(__dirname, 'src', 'components', 'layout', 'AppLayout.jsx'));
console.log('Done.');
