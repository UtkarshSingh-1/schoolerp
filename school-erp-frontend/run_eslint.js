import { execSync } from 'child_process';
import fs from 'fs';

try {
    const output = execSync('npx eslint .', { encoding: 'utf-8' });
    fs.writeFileSync('lint_utf8.log', output, 'utf-8');
} catch (error) {
    fs.writeFileSync('lint_utf8.log', error.stdout || error.stderr || error.message, 'utf-8');
}
console.log('Done writing lint_utf8.log');
