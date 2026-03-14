const fs = require('fs');
const path = require('path');

function convertVal(match, p1) {
    const val = parseFloat(p1);
    if (val > 3) {
        const remVal = val / 16;
        return `${Number(remVal.toFixed(4))}rem`;
    } else {
        return `${p1}px`;
    }
}

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Replace zinc-900 with zinc-800
    let newContent = content.replace(/zinc-900/g, 'zinc-800');

    // Replace px units > 3px with rem
    newContent = newContent.replace(/(\d+(?:\.\d+)?)px/g, convertVal);

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        return true;
    }
    return false;
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (dirPath.includes('node_modules') || dirPath.includes('.svelte-kit') || dirPath.includes('.git')) return;

        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const srcDir = path.join(__dirname, 'src');
const extensions = ['.svelte', '.css', '.ts'];
const modifiedFiles = [];

walkDir(srcDir, (filePath) => {
    if (extensions.some(ext => filePath.endsWith(ext))) {
        if (processFile(filePath)) {
            modifiedFiles.push(filePath);
        }
    }
});

console.log(`Modified ${modifiedFiles.length} files:`);
modifiedFiles.forEach(f => console.log(` - ${f}`));
