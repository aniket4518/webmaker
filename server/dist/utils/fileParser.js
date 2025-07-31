"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCodeResponse = parseCodeResponse;
function parseCodeResponse(response) {
    const files = [];
    const lines = response.split('\n');
    let currentFile = null;
    let currentContent = [];
    let inCodeBlock = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Check for file paths (like src/App.js, server.js, etc.)
        if (line.match(/^[\w\/\-\.]+\.(js|ts|jsx|tsx|css|html|json|md)$/)) {
            // Save previous file if exists
            if (currentFile && currentContent.length > 0) {
                files.push(createFileStructure(currentFile, currentContent.join('\n')));
            }
            currentFile = line;
            currentContent = [];
            inCodeBlock = false;
            continue;
        }
        // Check for code block markers
        if (line.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }
        // If we're in a code block or have a current file, collect content
        if (currentFile && (inCodeBlock || line.length > 0)) {
            currentContent.push(lines[i]); // Use original line with indentation
        }
    }
    // Save the last file
    if (currentFile && currentContent.length > 0) {
        files.push(createFileStructure(currentFile, currentContent.join('\n')));
    }
    return buildFileTree(files);
}
function createFileStructure(path, content) {
    const fileName = path.split('/').pop() || path;
    return {
        name: fileName,
        path: path,
        content: content.trim(),
        type: 'file'
    };
}
function buildFileTree(files) {
    const tree = [];
    const dirMap = new Map();
    // First, create all directories
    files.forEach(file => {
        var _a;
        const pathParts = file.path.split('/');
        let currentPath = '';
        for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            const parentPath = currentPath;
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            if (!dirMap.has(currentPath)) {
                const dir = {
                    name: part,
                    path: currentPath,
                    content: '',
                    type: 'directory',
                    children: []
                };
                dirMap.set(currentPath, dir);
                if (parentPath) {
                    const parent = dirMap.get(parentPath);
                    (_a = parent === null || parent === void 0 ? void 0 : parent.children) === null || _a === void 0 ? void 0 : _a.push(dir);
                }
                else {
                    tree.push(dir);
                }
            }
        }
    });
    // Then, place files in their directories
    files.forEach(file => {
        var _a;
        const pathParts = file.path.split('/');
        if (pathParts.length === 1) {
            // Root level file
            tree.push(file);
        }
        else {
            // File in a directory
            const dirPath = pathParts.slice(0, -1).join('/');
            const dir = dirMap.get(dirPath);
            if (dir) {
                (_a = dir.children) === null || _a === void 0 ? void 0 : _a.push(file);
            }
        }
    });
    return tree;
}
