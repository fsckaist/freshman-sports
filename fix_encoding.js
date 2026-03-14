const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (dirPath.includes('node_modules') || dirPath.includes('.svelte-kit') || dirPath.includes('.git')) return;

        let stat = fs.statSync(dirPath);
        if (stat.isDirectory()) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const srcDir = path.resolve('src');
const extensions = ['.svelte', '.css', '.ts'];

walkDir(srcDir, (filePath) => {
    if (extensions.some(ext => filePath.endsWith(ext))) {
        let content = fs.readFileSync(filePath, 'utf16le'); // Try reading as UTF-16
        // If it starts with script or something, it might be UTF-16
        // Actually, let's just use a more robust way to detect or just convert.
        // If it was written by Set-Content, it's likely UTF-16LE or UTF-8 with BOM.
    }
});
